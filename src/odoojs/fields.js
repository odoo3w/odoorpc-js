import { parseTime } from './utils.js'

import { is_virtual_id } from './models.js'

const image2url = (baseURL, model, res_id, field) => {
  // const baseURL = process.env.VUE_APP_BASE_API
  const imgUrl = '/web/image'
  if (!res_id) {
    return ''
  }

  const now = parseTime(new Date(), '{y}{m}{d}{h}{i}{s}')

  return `${baseURL}${imgUrl}?model=${model}&id=${res_id}&field=${field}&unique=${now}`
}

const tuples2ids = (tuples = [], ids0 = []) => {
  //
  const ids = tuples.reduce((acc, value) => {
    if (value[0] === 6 && value[2]) {
      acc = new Set(value[2] || [])
    } else if (value[0] === 5) {
      acc = new Set([])
    } else if ([4, 0, 1].includes(value[0]) && value[1]) {
      acc.add(value[1])
    } else if ([3, 2].includes(value[0]) && value[1]) {
      acc.delete(value[1])
    }
    return acc
  }, new Set(ids0))

  return [...ids]
}

const merge_tuples_one = (old_tuples, tuple_in) => {
  if ([6, 5].includes(tuple_in[0])) {
    // for m2m
    return [tuple_in]
  }

  const newval = tuple_in
  let to_append = [...tuple_in]

  const to_ret2 = old_tuples.reduce((to_ret, oldval) => {
    if ([6, 5].includes(oldval[0])) {
      // 1st, for m2m, # new=4,3, old=6,5
      to_ret = [...to_ret, oldval]
    } else if (newval[1] != oldval[1]) {
      // 2nd, id not equ
      // for m2m or o2m, # new=4,3,2,1,0, old=4,3,2,1,0, id not equ
      to_ret = [...to_ret, oldval]
    } else if (oldval[0] == 0) {
      // id equ.  new=0,
      if (newval[0] == 0) {
        // 3rd,  new=0, old=0, id equ
        to_append = [...newval]
      } else if ([2, 3].includes(newval[0])) {
        // 4th, for o2m, new line then delete, this a extend for odoo
        to_append = null
      } else {
        // 5th, never goto here
        to_append = null
      }
    } else if ([1, 4].includes(oldval[0])) {
      if ([1, 2, 3].includes(newval[0])) {
        // 6th, old line, then edit or del
        to_append = [...newval]
      } else if (newval[0] == 4) {
        // 7th,  few goto here. old then add,
        to_append = [...oldval]
      } else {
        // 8th, never goto here. old then ...
        to_append = null
      }
    } else if ([2, 3].includes(oldval[0])) {
      if (newval[0] == 4) {
        // 9th, del then add
        to_append = [...newval]
      } else {
        // 10th, never goto here. old=2,3.  new= 1,2,3. del then del
        to_append = [...oldval]
      }
    } else {
      // never goto here
      //
    }

    return to_ret
  }, [])

  const to_ret3 = to_append ? [...to_ret2, to_append] : [...to_ret2]

  return to_ret3
}

const merge_tuples = (old_tuples, new_tuples) => {
  const acc_init = [...old_tuples]
  return new_tuples.reduce((acc, cur) => {
    const ret = merge_tuples_one(acc, cur)
    acc = [...ret]
    return acc
  }, acc_init)
}

class BaseField {
  constructor(name, data) {
    this.name = name
    this.type = data.type || false
    this.string = data.string || false
    this.size = data.size || false
    this.required = data.required || false
    this.readonly = data.readonly || false
    this.help = data.help || false
    this.states = data.states || false
  }

  _get_readonly(instance) {
    let state = null
    if (instance._columns.state !== undefined) {
      state = instance._values.state[instance.id]
      const value_in_writed = instance._values_to_write.state[instance.id]
      if (value_in_writed !== undefined) {
        state = value_in_writed
      }
    }
    // console.log(this.name, ret, this.readonly, JSON.stringify(this.states))

    if (state && this.states && this.states[state]) {
      const readonly3 = this.states[state].reduce((acc, cur) => {
        acc[cur[0]] = cur[1]
        return acc
      }, {})

      if (readonly3.readonly !== undefined) {
        return readonly3.readonly
      }
    }
    return this.readonly
  }

  get_for_create(instance) {
    return this._get_for_create(instance)
  }

  get_for_write(instance) {
    return this._get_for_write(instance)
  }

  _get_for_create(instance) {
    const columns = Object.keys(instance.field_onchange).filter(
      col => col.split('.').length === 1
    )
    if (!columns.includes(this.name)) {
      return null
    }
    if (this._get_readonly(instance)) {
      return null
    }
    const value = instance._values[this.name][instance.id]
    if (value === undefined) {
      return null
    }
    const value_in_write = instance._values_to_write[this.name][instance.id]
    return value_in_write !== undefined ? value_in_write : value
  }

  _get_for_write(instance) {
    if (this._get_readonly(instance)) {
      return null
    }
    const value = instance._values_to_write[this.name][instance.id]
    if (value === undefined) {
      return null
    }
    return value
  }

  get_for_onchange(instance) {
    return this._getValue(instance)
  }

  getValue(instance) {
    return this._getValue(instance)
  }
  _getValue(instance) {
    let value = instance._values[this.name][instance.id]
    const value_in_writed = instance._values_to_write[this.name][instance.id]
    if (value_in_writed !== undefined) {
      value = value_in_writed
    }
    return value
  }

  async setValue(instance, value) {
    return this._setValue(instance, value)
  }

  async _setValue(instance, value) {
    // value = this.check_value(value)
    instance._values_to_write[this.name][instance.id] = value

    if (!instance.field_onchange) {
      return new Promise(resolve => resolve(this.name))
    }

    await instance.trigger_onchange(this.name)

    return new Promise(resolve => resolve(this.name))
  }

  commit(/* instance */) {
    // only a skeleton, to be overrid for o2m
  }
}

class Binary extends BaseField {
  constructor(name, data) {
    super(name, data)
  }

  getValue(instance) {
    const url = image2url(
      instance.constructor._odoo.baseURL,
      instance.constructor._name,
      instance.id,
      this.name
    )

    return url
  }
}

class Boolean2 extends BaseField {
  constructor(name, data) {
    super(name, data)
  }
}

class Char extends BaseField {
  constructor(name, data) {
    super(name, data)
  }
}

class Date2 extends BaseField {
  constructor(name, data) {
    super(name, data)
  }

  getValue(instance) {
    const value = this._getValue(instance)
    return value ? new Date(value) : value
  }
}

class Datetime extends BaseField {
  constructor(name, data) {
    super(name, data)
  }

  getValue(instance) {
    const value = this._getValue(instance)
    function parseDate(dateString) {
      const [date, time] = dateString.split(' ')
      return new Date(`${date}T${time}.000Z`) // Z = UTC
    }
    return value ? parseDate(value) : value
  }
}

class Float extends BaseField {
  constructor(name, data) {
    super(name, data)
  }

  getValue(instance) {
    const value = this._getValue(instance)
    return value ? value : 0.0
  }
}

class Integer extends BaseField {
  constructor(name, data) {
    super(name, data)
    this.selection = data.selection || false
  }

  getValue(instance) {
    const value = this._getValue(instance)
    return value ? value : 0
  }
}

class Selection2 extends BaseField {
  constructor(name, data) {
    super(name, data)
  }
}

class Many2many extends BaseField {
  constructor(name, data) {
    super(name, data)
    this.relation = data.relation || false
    this.context = data.context || {}
    this.domain = data.domain || false
  }

  get_for_onchange(instance) {
    // in _values:  (6, 0, ids)
    // in _values_to_write:  (5,), (4,id), (3,id)

    const tuples = []
    const ids_old = instance._values[this.name][instance.id] || []
    tuples.push([6, 0, ids_old])

    const value_in_writed = instance._values_to_write[this.name][instance.id]
    if (value_in_writed !== undefined) {
      const tuple_in_write = value_in_writed || []
      tuple_in_write.forEach(tuple_ => {
        tuples.push(tuple_)
      })
    }
    return tuples
  }

  async getValue(instance) {
    let ids = instance._values[this.name][instance.id]
    const value_in_writed = instance._values_to_write[this.name][instance.id]
    if (value_in_writed !== undefined) {
      const values = value_in_writed
      ids = tuples2ids(values, ids || [])
    } else {
      ids = [...ids]
    }

    const Relation = instance.env.model(this.relation)

    const get_env = () => {
      if (!this.context) {
        return instance.env
      }
      const context = { ...instance.env.context, ...this.context }
      return instance.env.copy(context)
    }

    const kwargs = { from_record: [instance, this] }
    return Relation._browse(get_env(), ids, kwargs)
  }

  setValue(instance, value) {
    // TBD
    // m2m 如何 set value?
    // m2m 只有一种编辑方式? 多选框?
    // 6, 5, 4, 3
    // 初始值 为 (6,0,[])
    // 然后 (4,id), (3,id) 去增加和删除
    return this._setValue(instance, value)
  }
}

class Many2one extends BaseField {
  constructor(name, data) {
    super(name, data)
    this.relation = data.relation || false
    this.context = data.context || {}
    this.domain = data.domain || false
  }

  async getValue(instance) {
    const id_ = this._getValue(instance)
    const Relation = instance.env.model(this.relation)

    const get_env = () => {
      if (!this.context) {
        return instance.env
      }
      const context = { ...instance.env.context, ...this.context }
      return instance.env.copy(context)
    }

    const kwargs = { from_record: [instance, this] }
    return Relation._browse(get_env(), id_ || false, kwargs)
  }

  setValue(instance, value) {
    // TBD
    // m2o 如何 set value?
    return this._setValue(instance, value)
  }
}

class One2many extends BaseField {
  constructor(name, data) {
    super(name, data)
    this.relation = data.relation || false
    this.context = data.context || {}
    this.domain = data.domain || false

    this.relation_field = data.relation_field || false
  }

  async _init_storage(instance) {
    if (!instance._values_relation) {
      instance._values_relation = {}
    }
    if (!instance._values_relation[this.name]) {
      instance._values_relation[this.name] = {}
      const storage = instance._values_relation[this.name]
      storage.records = null
      storage._values = {}
      storage._values_to_write = {}

      const Relation = instance.env.model(this.relation)
      await Relation.init()

      Object.keys(Relation._columns).forEach(field => {
        storage._values[field] = {}
        storage._values_to_write[field] = {}
      })
    }
  }

  _get_storage_records(instance) {
    if (instance._values_relation) {
      if (instance._values_relation[this.name]) {
        const storage = instance._values_relation[this.name]
        return storage.records
      }
    }
    return null
  }

  async _get_storage(instance) {
    await this._init_storage(instance)
    const storage = instance._values_relation[this.name]
    return storage
  }

  _get_storage_sync(instance) {
    if (instance._values_relation) {
      if (instance._values_relation[this.name]) {
        const storage = instance._values_relation[this.name]
        return storage
      }
    }
    return null
  }

  async getValue(instance) {
    const get_relation = async () => {
      let ids = instance._values[this.name][instance.id]
      if (ids === null) {
        const args = [[instance.id], [this.name]]
        const kwargs = { context: this.context, load: '_classic_write' }

        const payload = [instance._name, 'read', args, kwargs]
        const res = await instance._odoo.execute_kw(...payload)
        const orig_ids = res[0][this.name] || []
        instance._values[this.name][instance.id] = orig_ids
        ids = [...orig_ids]
      } else {
        // copy for ids
        ids = [...ids]
      }

      const value_in_writed = instance._values_to_write[this.name][instance.id]
      if (value_in_writed !== undefined) {
        const values = value_in_writed
        ids = tuples2ids(values, ids || [])
      }

      const Relation = instance.env.model(this.relation)
      const get_env = () => {
        if (!this.context) {
          return instance.env
        }
        const context = { ...instance.env.context, ...this.context }
        return instance.env.copy(context)
      }

      const kwargs = { from_record: [instance, this] }
      return Relation._browse(get_env(), ids, kwargs)
    }

    if (!instance.field_onchange) {
      return get_relation()
    }

    const storage = await this._get_storage(instance)
    if (storage.records) {
      return storage.records
    }

    const relation = await get_relation()
    storage.records = relation
    return relation
  }

  // set value ?
  _update_relation(instance, o2m_id, values) {
    const op = !is_virtual_id(o2m_id) ? 1 : 0
    const new_value = [[op, o2m_id, values]]
    const old_value = instance._values_to_write[this.name][instance.id] || []
    const values_to_write = merge_tuples(old_value, new_value)
    instance._values_to_write[this.name][instance.id] = values_to_write
    const relation = this._get_storage_records(instance)
    if (relation && !relation._ids.includes(o2m_id)) {
      relation._ids.push(o2m_id)
    }
  }

  _get_for_CU(instance, value) {
    if (value === null) {
      return value
    }
    const relation = this._get_storage_records(instance)

    if (!relation) {
      return value
    }

    const value2 = value.reduce((acc, tup) => {
      if (tup[0] === 0 || tup[0] === 1) {
        acc.push(tup)
      } else {
        const index = relation.ids.findIndex(item => item === tup[1])
        const relation2 = relation.slice(index, index + 1)
        const tup_vals2 = tup[0]
          ? relation2._get_values_for_write()
          : relation2._get_values_for_create()
        acc.push([tup[0], tup[1], tup_vals2])
      }
      return acc
    }, [])

    return value2
  }

  get_for_create(instance) {
    const value = this._get_for_create(instance)
    return this._get_for_CU(instance, value)
  }

  get_for_write(instance) {
    const value = this._get_for_write(instance)
    return this._get_for_CU(instance, value)
  }

  get_for_onchange(instance, for_parent) {
    // in _values:  [(4, id1, ),(4, id2, )]
    // in _values_to_write:  (0,id,{}), (1,id, {}), (2,id)

    const ids_old = instance._values[this.name][instance.id] || []

    let tuples = ids_old.map(id_ => [4, id_, 0])
    const value_in_writed = instance._values_to_write[this.name][instance.id]

    if (value_in_writed !== undefined) {
      const tuple_in_write = value_in_writed || []
      const merged = merge_tuples([...tuples], tuple_in_write)
      tuples = [...merged]
    }

    if (for_parent) {
      return tuples
    }

    const relation = this._get_storage_records(instance)
    if (!relation) {
      return tuples
    }

    const value2 = tuples.reduce((acc, tup) => {
      if (tup[0] !== 0 && tup[0] !== 1) {
        acc = [...acc, tup]
      } else {
        const index = relation.ids.findIndex(id_ => id_ === tup[1])
        const relation2 = relation.slice(index, index + 1)
        const tup_vals2 = relation2._get_values_for_onchange({
          for_relation: true
        })
        const new_tup = [tup[0], tup[1], tup_vals2]
        acc = [...acc, new_tup]
      }
      return acc
    }, [])

    return value2
  }

  commit(instance) {
    const storage = this._get_storage_sync(instance)
    if (!(storage && storage.records)) {
      return
    }

    const records = storage.records
    Object.keys(records._values).forEach(field => {
      const values = records._values[field]
      Object.keys(values).forEach(o2m_id => delete values[o2m_id])
    })

    Object.keys(records._values_to_write).forEach(field => {
      const values = records._values_to_write[field]
      Object.keys(values).forEach(o2m_id => delete values[o2m_id])
    })

    storage.records = null
  }
}

class Reference extends BaseField {
  constructor(name, data) {
    super(name, data)
    this.context = data.context || {}
    this.domain = data.domain || false
    this.selection = data.selection || false
  }

  getValue(instance) {
    const value = this._getValue(instance)

    if (value) {
      const [relation2, o_id2] = value.split(',')
      const relation = relation2.trim()
      const o_id = parseInt(o_id2)
      if (relation && o_id) {
        //
        const Relation = instance.env.model(relation)

        const get_env = () => {
          if (!this.context) {
            return instance.env
          }
          const context = { ...instance.env.context, ...this.context }
          return instance.env.copy(context)
        }

        const kwargs = { from_record: [instance, this] }
        return Relation._browse(get_env(), o_id, kwargs)
      }
    }

    return value

    // return [value, ...instance._ids]
    // [instance.constructor._name, instance.id, this.name]
  }
}

class Text extends BaseField {
  constructor(name, data) {
    super(name, data)
  }
}

class Html extends Text {
  constructor(name, data) {
    super(name, data)
  }
}

class Unknown extends BaseField {
  constructor(name, data) {
    super(name, data)
  }
}

const TYPES_TO_FIELDS = {
  binary: Binary,
  boolean: Boolean2,
  char: Char,
  date: Date2,
  datetime: Datetime,
  float: Float,
  html: Html,
  integer: Integer,
  many2many: Many2many,
  many2one: Many2one,
  one2many: One2many,
  reference: Reference,
  selection: Selection2,
  text: Text
}

export const generate_field = (name, data) => {
  const Field2 = TYPES_TO_FIELDS[data.type]
  const Field = Field2 ? Field2 : Unknown

  const field = new Field(name, data)
  return field
}

export const fields_for_test = {
  merge_tuples,
  merge_tuples_one,
  One2many
}
