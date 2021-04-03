//
// env.model(model, view_type, view_ref)
// 默认必须有 view_type
// 这样  o2m 字段 已经嵌套带回来 fields
// 所有的 o2m 字段 的 进一步 env.model()  只能从这个 view_info 中 生成, 不能再 发送请求
//

// o2m 字段 的 的数据刷新 几种可能性:
// 1 主动 刷新 getValue
// 2 o2m.new
// 3 onchange 带回来的
//
// 改造 架构：o2m browse
// 1 取 Model, 不能发请求, 因为
// 2 做 records 空壳 不能发请求
// 3 需要时 read 数据, 可以发请求
// 4 初始化数据, 不管 数据从哪里来的 我只负责 初始化数据
//

import { parseTime } from './utils.js'

import { is_virtual_id, Model } from './models.js'

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

// 这是  odoo 中 仅有的 string domain 中需要的 变量
// 如果 是扩展模块, 有额外的 需要, 则 该处代码需要改为可配置的
// TBD 2021-3-10
const Globals_Dict = ['company_id', 'country_id', 'product_uom_category_id']

const eval_safe = (domain, globals_dict = {}, locals_dict = {}) => {
  const to_replaced = { '\\(': '[', '\\)': ']', False: 'false', True: 'true' }

  let domain2 = domain
  Object.keys(to_replaced).forEach(item => {
    domain2 = domain2.replace(new RegExp(item, 'g'), to_replaced[item])
  })

  const kwargs = { ...globals_dict, ...locals_dict }

  const fn_str = []
  fn_str.push('() => {')
  Object.keys(kwargs).forEach(item => {
    fn_str.push(`const ${item} = ${kwargs[item]}`)
  })
  fn_str.push(`return ${domain2}`)
  fn_str.push('}')

  const fn_str2 = fn_str.join('\n')
  // console.log(fn_str2)
  const fn = eval(fn_str2)
  const ret = fn()
  // console.log(ret)

  return ret
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
    this.views = data.views || {}
  }

  print2(method, instance, ...args) {
    // console.log('method, model, ids, field, args')
    console.log(method, instance._name, instance.ids, this.name, ...args)
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

  fetch_one(instance) {
    // this.print2('fetchone,', instance)
    return { [this.name]: this.value(instance) }
  }
  value(instance) {
    // 给 instance  fetch_one 使用
    return this._getValue(instance)
  }

  getValue(instance) {
    // console.log(' get value,', instance._name, instance.id, this.name)
    // 给 instance  __defineGetter__ 使用
    return this._getValue(instance)
  }

  _getValue(instance) {
    // 取数的实现
    let value = instance._values[this.name][instance.id]
    const value_in_writed = instance._values_to_write[this.name][instance.id]
    if (value_in_writed !== undefined) {
      value = value_in_writed
    }
    return value
  }

  _init_storage(instance) {
    // 供 instance browse 使用
    if (instance._values[this.name] === undefined) {
      instance._values[this.name] = {}
    }
    if (instance._values_to_write[this.name] === undefined) {
      instance._values_to_write[this.name] = {}
    }
  }

  _init_values(instance, instance_id, value) {
    // 供 instance browse 使用
    instance._values[this.name][instance_id] = value
  }

  _init_values_to_write(instance, instance_id, value) {
    // 供 instance browse 使用
    instance._values_to_write[this.name][instance_id] = value
  }

  setValueByOnchange(instance, value) {
    // after onchange form odoo, to set value
    return this._setValue(instance, value)
  }

  _setValue(instance, value) {
    instance._values_to_write[this.name][instance.id] = value
    instance.event_onchange(this.name)
  }

  async setValue(instance, value) {
    // 给 instance  __defineSetter__ 使用
    // 这个是 触发 odoo set value
    // value = this.check_value(value)
    this._setValue(instance, value)

    if (instance.field_onchange) {
      await instance.trigger_onchange(this.name)
    }

    return new Promise(resolve => resolve(this.name))
  }

  commit(/* instance  */) {
    // only a skeleton, to be overrid for o2m
  }

  after_commit(/* instance  */) {
    // only a skeleton, to be overrid for o2m
  }
}

class Binary extends BaseField {
  constructor(name, data) {
    super(name, data)
  }

  value(instance) {
    // 给 instance  fetch_one 使用
    return this.getValue(instance)
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

  get_for_onchange(instance) {
    const value = super._getValue(instance)
    return value
  }

  _getValue(instance) {
    const value = super._getValue(instance)
    return value ? new Date(value) : value
  }

  // setValue ? 应该反转吧?
}

class Datetime extends BaseField {
  constructor(name, data) {
    super(name, data)
  }

  get_for_onchange(instance) {
    const value = super._getValue(instance)
    return value
  }

  _getValue(instance) {
    const value = super._getValue(instance)
    function parseDate(dateString) {
      const [date, time] = dateString.split(' ')
      return new Date(`${date}T${time}.000Z`) // Z = UTC
    }
    return value ? parseDate(value) : value
  }

  // setValue ? 应该反转吧?
}

class Float extends BaseField {
  constructor(name, data) {
    super(name, data)
  }

  _getValue(instance) {
    const value = super._getValue(instance)
    return value ? value : 0.0
  }
}

class Integer extends BaseField {
  constructor(name, data) {
    super(name, data)
    this.selection = data.selection || false
  }

  _getValue(instance) {
    const value = super._getValue(instance)
    return value ? value : 0
  }
}

class Selection2 extends BaseField {
  constructor(name, data) {
    super(name, data)
    this.selection = data.selection || []
  }

  get_selection(/*instance*/) {
    return this.selection
  }

  fetch_one(instance) {
    const values1 = super.fetch_one(instance)
    const value_name = this.valueName(instance)
    const values = { ...values1, [`${this.name}__name`]: value_name }
    return values
  }

  valueName(instance) {
    const value = this._getValue(instance)
    if (!value) {
      return ''
    }

    const ops = this.selection.reduce((acc, cur) => {
      acc[cur[0]] = cur[1]
      return acc
    }, {})

    return ops[value]
  }
}

class _Relational extends BaseField {
  constructor(name, data) {
    super(name, data)
    this.relation = data.relation || false
    this.context = data.context || {}
    this.domain = data.domain || false
  }

  _init_storage(instance) {
    super._init_storage(instance)
    // if (instance._values[this.name] === undefined) {
    //   instance._values[this.name] = {}
    // }
    // if (instance._values_to_write[this.name] === undefined) {
    //   instance._values_to_write[this.name] = {}
    // }
    if (instance._values_relation[this.name] === undefined) {
      instance._values_relation[this.name] = {}
      // so. sol, invoices
      const relation_storage = instance._values_relation[this.name]
      relation_storage._values = {}
      // relation_storage._values.display_name = {}
      relation_storage._values_to_write = {}
      relation_storage._values_relation = {}
    }
  }

  async new(/*instance*/) {
    // only for o2m
    // console.log('new', instance._name, instance.ids, this.name)
  }
}

class Many2many extends _Relational {
  constructor(name, data) {
    super(name, data)
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

  // // 返回原生的 [ids],
  // value(instance) {
  //   return this._getValue(instance)
  // }

  _getValue(instance) {
    let ids = instance._values[this.name][instance.id] || []
    const value_in_writed = instance._values_to_write[this.name][instance.id]
    if (value_in_writed !== undefined) {
      const values = value_in_writed
      ids = tuples2ids(values, ids || [])
    } else {
      ids = [...ids]
    }
    return ids
  }

  // 返回 异步 对象
  // TBD
  async getValue(instance) {
    const ids = this._getValue(instance)
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
    return super.setValue(instance, value)
  }
}

class Many2one extends _Relational {
  constructor(name, data) {
    super(name, data)
  }

  _init_storage(instance) {
    super._init_storage(instance)
    const relation_storage = instance._values_relation[this.name]
    relation_storage._values.display_name = {}
  }

  // ok call by get_selection
  async _get_domain(instance) {
    /*
    // # 仅被 get_selection 使用

    // # 在多公司时, 用户可能 用 allowed_company_ids 中的一个
    // # 允许 用户 在前端 自己在 allowed_company_ids 中 选择 默认的公司
    // # 该选择 需要 存储在 本地 config 中

    // #  全部 odoo 只有这4个 模型 在获取 fields_get时, 需要提供 globals_dict, 设置 domain
    // #  其余的只是需要 company_id
    // #  --- res.partner
    // #  <-str---> state_id [('country_id', '=?', country_id)]

    // #  --- sale.order.line
    // #  <-str---> product_uom [('category_id', '=', product_uom_category_id)]

    // #  --- purchase.order.line
    // #  <-str---> product_uom [('category_id', '=', product_uom_category_id)]

    // #  --- stock.move
    // #  <-str---> product_uom [('category_id', '=', product_uom_category_id)]
    */

    const _get_company_id = () => {
      const session_info = instance._odoo.session_info
      // # company_id = session_info['company_id']
      const user_companies = session_info.user_companies
      const current_company = user_companies.current_company[0]
      // # allowed_companies = user_companies['allowed_companies']
      // # allowed_company_ids = [com[0] for com in allowed_companies]
      return current_company
    }

    const _get_values_for_domain = () => {
      const globals_fields = Globals_Dict

      const values = globals_fields.reduce((acc, col) => {
        const meta = instance._columns[col]
        if (meta) {
          meta.value(instance)
          // console.log('vsls', col, meta)
          acc[col] = meta.value(instance)
        }
        return acc
      }, {})
      if (!values.company_id) {
        values.company_id = _get_company_id()
      }
      return values
    }

    const _get_res_model_id = async () => {
      if (instance._model_id) {
        return instance._model_id
      }

      const dm = [['model', '=', instance._name]]
      const model_ids = await instance._odoo.execute('ir.model', 'search', dm)
      const model_id = model_ids.length ? model_ids[0] : 0
      this._model_id = model_id
      return model_id
    }

    const domain = this.domain || false

    if (domain && typeof domain === 'string') {
      // console.log('domain: ', this.name, domain)
      const values = _get_values_for_domain()
      const globals_dict = {
        res_model_id: await _get_res_model_id(),
        ...values
      }

      const domain2 = eval_safe(domain, globals_dict)
      // console.log('domain2: ', domain2)
      return domain2
    } else {
      return domain
    }
  }

  async get_selection(instance) {
    //
    // console.log(' get selection,', instance._name, instance.id, this.name)

    const domain = await this._get_domain(instance)

    const relation = this.relation
    // ? TBD, 是否 在 context 中, 有 string domain 需要的 values?
    // const context = this.context
    const selection = await instance.env
      .model(relation)
      .execute_kw('name_search', [], { args: domain })

    //
    // console.log(' get selection,2 ', selection)
    selection.forEach(value => {
      instance._values_relation[this.name]._values.display_name[value[0]] =
        value[1]
    })

    return selection
  }

  fetch_one(instance) {
    const values1 = super.fetch_one(instance)
    const value_name = this.valueName(instance)
    const values = { ...values1, [`${this.name}__name`]: value_name }
    return values
  }

  // 返回  m2o display_name
  valueName(instance) {
    const id_ = this._getValue(instance)
    if (!id_) {
      return ''
    }
    const value = instance._values_relation[this.name]._values.display_name[id_]
    return value
  }

  // 返回 异步 对象
  async asyncGetValue(instance) {
    const ids = this._getValue(instance)
    const Relation = instance.env.model(this.relation)

    const get_env = () => {
      if (!this.context) {
        return instance.env
      }
      const context = { ...instance.env.context, ...this.context }
      return instance.env.copy(context)
    }
    return Relation._browse_native(get_env(), ids)
  }

  // 返回 同步对象
  getValue(instance) {
    const id_ = this._getValue(instance)
    const Relation = instance.env.model(this.relation, 'many2one', {
      isSync: true,
      view_info: {
        fields: {
          display_name: { type: 'char', string: 'Name', readonly: true }
        }
      }
    })

    const get_env = () => {
      if (!this.context) {
        return instance.env
      }
      const context = { ...instance.env.context, ...this.context }
      return instance.env.copy(context)
    }

    const kwargs = { from_record: [instance, this] }
    return Relation._browse_relation_m2o(get_env(), id_ || false, kwargs)
  }

  _init_values(instance, instance_id, value) {
    // 缺省 使用 _classic_read,  m2o 字段 返回 [m2o.id, m2o.display_name]
    // 存储 m2o.id:   this._values[field][row.id] = m2o.id
    // 存储 m2o.name: this._values_relation[field]._values.display_name[m2o.id] = m2o.display_name

    instance._values[this.name][instance_id] = value ? value[0] : value
    if (value && value[1]) {
      instance._values_relation[this.name]._values.display_name[value[0]] =
        value[1]
    }
  }

  setValueByOnchange(instance, value) {
    instance._values_to_write[this.name][instance.id] = value ? value[0] : value
    if (value && value[1]) {
      instance._values_relation[this.name]._values.display_name[value[0]] =
        value[1]
    }
    instance.event_onchange(this.name)
  }

  // async setValue(instance, value) {
  //   // 首先 要 get selection, 那么 set之后, valueName 才会有值
  //   // 当然, 没有 selection, 也无法 set value
  //   return super.setValue(instance, value)
  // }
}

class One2many extends _Relational {
  constructor(name, data) {
    super(name, data)
    this.relation_field = data.relation_field || false
  }

  _get_storage_records(instance) {
    // const storage = instance._values_relation[this.name] || {}
    const storage = instance._values_relation[this.name]
    return storage.records
  }

  _get_for_CU(instance, value) {
    // console.log(' _get_for_CU,', instance._name, instance.id, this.name)
    if (value === null) {
      return value
    }

    const relation = this._get_storage_records(instance)

    if (!relation) {
      return value
    }
    // console.log(
    //   ' _get_for_CU 4, ',
    //   instance._name,
    //   instance.id,
    //   this.name,
    //   value,
    //   relation
    // )

    const value2 = value.reduce((acc, tup) => {
      if (tup[0] !== 0 && tup[0] !== 1) {
        acc.push([...tup])
      } else {
        const relation2 = relation._getById(tup[1])
        // console.log(tup, tup[1], relation2)
        const tup_vals2 = tup[0]
          ? relation2._get_values_for_write()
          : relation2._get_values_for_create()

        // console.log(tup, tup_vals2)

        acc.push([tup[0], tup[1], tup_vals2])
      }
      return acc
    }, [])

    // console.log(
    //   ' _get_for_CU 6,',
    //   instance._name,
    //   instance.id,
    //   this.name,
    //   value2
    // )

    return value2
  }

  get_for_create(instance) {
    const value = super.get_for_create(instance)
    return this._get_for_CU(instance, value)
  }

  get_for_write(instance) {
    const value = super.get_for_write(instance)
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
        const relation2 = relation._getById(tup[1])
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

  fetch_one(instance) {
    const values1 = super.fetch_one(instance)
    const value_records = this.valueRecords(instance)
    const values = { ...values1, [`${this.name}__record`]: value_records }

    return values
  }

  // 返回 [records]
  valueRecords(instance) {
    const storage = instance._values_relation[this.name]

    const relation = storage.records

    if (relation) {
      const records = relation.fetch_all()
      return records
    } else {
      const ids = this.value(instance)
      const records = ids.map(id_ => {
        return { id: id_ }
      })
      return records
    }
  }

  // // 返回 [ids]
  // value(instance) {
  //   return this._getValue(instance)
  // }

  _getValue(instance) {
    let ids = instance._values[this.name][instance.id] || []
    const value_in_writed = instance._values_to_write[this.name][instance.id]
    if (value_in_writed !== undefined) {
      const values = value_in_writed
      ids = tuples2ids(values, ids || [])
    } else {
      ids = [...ids]
    }
    return ids
  }

  _get_Relation(instance) {
    const view_info = instance._view_info
    const my_views = view_info.fields[this.name].views
    // o2m 一定是使用  tree or kanban view, 不可能是 form view
    // o2m 单行编辑时, 用 tree or form view,
    if (my_views.tree) {
      return instance.env.model(this.relation, 'tree', {
        view_info: my_views.tree
      })
    } else if (my_views.kanban) {
      return instance.env.model(this.relation, 'kanban', {
        view_info: my_views.kanban
      })
    } else {
      return instance.env.model(this.relation)
    }
  }

  _get_env(instance) {
    if (!this.context) {
      return instance.env
    }
    const context = { ...instance.env.context, ...this.context }
    return instance.env.copy(context)
  }

  // 返回 同步对象
  getValue(instance, force) {
    // console.log(
    //   ' getValue, ',
    //   instance._name,
    //   instance.id,
    //   this.name,
    //   this.value(instance)
    // )

    const storage = instance._values_relation[this.name]

    if (storage.records && !force) {
      return storage.records
    } else {
      const Relation = this._get_Relation(instance)
      const env = this._get_env(instance)
      const ids = this._getValue(instance)
      const kwargs = { from_record: [instance, this] }
      const relation = Relation._browse_relation_o2m(env, ids || false, kwargs)

      storage.records = relation

      relation.event_onchange_all()
      return relation
    }
  }

  // async setValue(instance, value) {
  //   // TBD
  //   return super.setValue(instance, value)
  // }

  // set value ? [0,id, {}], [1, id, {}]
  setValueFromRelation(instance, o2m_id, values) {
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

  // TBD
  setValueByOnchange(instance, tuples) {
    // console.log('xxxx,', this.name, instance._name, instance.id, tuples)

    // console.log('xxxx,', relation, relation_records)

    tuples.forEach(tup => {
      // TBD event.event change event.type 时, 返回的是 全 [0,0,{}]
      // 如果其他情况, TBD
      if (tup[0] === 5) {
        //remove all
        this._update_relation_by_remove(instance, [tup])
      } else if (tup[0] === 0) {
        // console.log(tup)
        this.new_sync(instance, tup[2])
      }
    })

    instance.event_onchange(this.name)
  }

  _update_relation_by_remove(instance, tuples) {
    const new_value = tuples
    const old_value = instance._values_to_write[this.name][instance.id] || []
    const values_to_write = merge_tuples(old_value, new_value)
    instance._values_to_write[this.name][instance.id] = values_to_write
    const relation = this.getValue(instance, true)
    return relation

    // Object.keys(records._values).forEach(field => {
    //   const values = records._values[field]
    //   delete values[o2m_id]
    // })

    // Object.keys(records._values_to_write).forEach(field => {
    //   const values = records._values_to_write[field]
    //   delete values[o2m_id]
    // })
  }

  new_sync(instance, values) {
    const relation = this.getValue(instance)
    const Relation = this._get_Relation(instance)
    const env = this._get_env(instance)
    const iterated = relation
    const kwargs = { from_record: [instance, this], iterated, values }
    const ids = instance._odoo._get_virtual_id()
    Relation._browse_relation_o2m_new(env, ids, kwargs)
  }

  // set value, new a model, onchange, then call setValueFromRelation
  // TBD
  async new(instance) {
    // console.log('new', instance._name, instance.ids, this.name)

    // const Relation = instance.env.model(this.relation)
    // const get_env = () => {
    //   if (!this.context) {
    //     return instance.env
    //   }
    //   const context = { ...instance.env.context, ...this.context }
    //   return instance.env.copy(context)
    // }
    // console.log('new1,', instance._name, instance.ids, this.name)
    // const new_relation = await Relation._browse(get_env(), null, kwargs)

    const storage = instance._values_relation[this.name]
    const iterated = storage.records
    const Relation = this._get_Relation(instance)
    const env = this._get_env(instance)
    const ids = instance._odoo._get_virtual_id()
    const kwargs = { from_record: [instance, this], iterated }

    const new_relation = await Relation._browse_relation_o2m_new_async(
      env,
      ids,
      kwargs
    )

    // 在 onchange 里 更新 parent
    // 同时也触发 callback 返回页面

    // new 时, 相当于 列表变更, 故 全部刷新下
    iterated.event_onchange_all()
    // console.log('new3,', instance._name, instance.ids, this.name)
    return new_relation
  }

  remove_one_sync(instance, relation_to_remove) {
    const o2m_id =
      relation_to_remove instanceof Model
        ? relation_to_remove.id
        : relation_to_remove

    const new_value = [[2, o2m_id, 0]]
    this._update_relation_by_remove(instance, new_value)
  }

  // set value ? del one,  [2, id, 0]
  async remove(instance, relation_to_remove) {
    // console.log('remove1:', instance._name, instance.ids, this.name)

    const o2m_id =
      relation_to_remove instanceof Model
        ? relation_to_remove.id
        : relation_to_remove

    const new_value = [[2, o2m_id, 0]]

    const relation = this._update_relation_by_remove(instance, new_value)

    if (instance.field_onchange) {
      await instance.trigger_onchange(this.name)
    }

    // remove 时, 相当于 列表变更, 故 全部刷新下
    // console.log('remove:', relation.ids)
    relation.event_onchange_all()
  }

  async after_commit(instance) {
    // create and write commit 之后, then read from odoo
    //  因此数据已经变更, 重新读取 o2m 的数据
    const storage = instance._values_relation[this.name]
    if (storage && storage.records) {
      storage.records = null
      await this.getValue(instance)
    }
  }

  commit(instance) {
    const storage = instance._values_relation[this.name]

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
  }
}

class Reference extends BaseField {
  constructor(name, data) {
    super(name, data)
    this.context = data.context || {}
    this.domain = data.domain || false
    this.selection = data.selection || false
  }

  // TBD
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
