//
// env.model1(model, view_type, view_ref)
// 默认必须有 view_type
// 这样  o2m 字段 已经嵌套带回来 fields
// 所有的 o2m 字段 的 进一步 env.model1()  只能从这个 view_info 中 生成, 不能再 发送请求
//

// o2m 字段 的 的数据刷新 几种可能性:
// 1 主动 刷新 getValue1
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
import { Model } from './models.js'

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

class BaseField1 {
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

    this._input_ids = {}
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

  getInputId(instance) {
    // call by Vue View
    const input_id_key = `${instance._name},${instance.id},${this.name}`
    const input_id = this._input_ids[input_id_key]
    if (!input_id) {
      this._input_ids[input_id_key] = instance._odoo._get_input_id()
    }
    // console.log(' getInputId  ', this._input_ids, input_id_key)
    return this._input_ids[input_id_key]
  }

  /* get */

  raw_value(instance) {
    // 取数的实现
    let value = instance._values[this.name][instance.id]
    const value_in_writed = instance._values_to_write[this.name][instance.id]
    if (value_in_writed !== undefined) {
      value = value_in_writed
    }
    return value
  }

  getValue(instance) {
    // console.log(' get value,', instance._name, instance.id, this.name)
    // 给 instance  __defineGetter__ 使用
    return this.raw_value(instance)
  }

  fetch_one(instance) {
    return { [this.name]: this.value(instance) }
  }

  value(instance) {
    return this.raw_value(instance)
  }

  get_for_onchange(instance) {
    return this.raw_value(instance)
  }

  /* set */

  _set_default(instance) {
    instance._values[this.name][instance.id] = false
  }

  _set_by_init(instance, record) {
    // 供 instance browse 使用
    instance._values[this.name][record.id] = record[this.name]
  }

  // 是否 需要?  call  instance.event_onchange(this.name)
  _set_by_object(instance, object) {
    const src = object._values[this.name]
    const dst = instance._values[this.name]
    instance._values[this.name] = { ...dst, ...src }

    const src_wr = object._values_to_write[this.name]
    const dst_wr = instance._values_to_write[this.name]
    instance._values_to_write[this.name] = { ...dst_wr, ...src_wr }
  }

  _set_by_onchnge(instance, value) {
    // after onchange form odoo, to set value
    this._setValue(instance, value)
    instance.event_onchange(this.name)
  }

  _setValue(instance, value) {
    //  单独定义 是因为 m2m 字段需要重写
    instance._values_to_write[this.name][instance.id] = value
  }
  async setValue(instance, value) {
    // 给 instance  __defineSetter__ 使用
    // view 页面 直接 set 数据
    console.log('to set, 1, ', [this.name, value])
    // console.log('set:', instance._name, instance.id, this.name, value)
    // 这个是 触发 odoo set value
    // value = this.check_value(value)

    this._setValue(instance, value)
    instance.event_onchange(this.name)
    return this._setValue_after(instance, value)
  }

  async _setValue_after(instance, value) {
    // 单独 提出来, 是因为 o2m 需要调用
    if (instance.field_onchange) {
      await instance.trigger_onchange(this.name)
      console.log('to set, 1999999 ', [this.name, value])
    }

    return new Promise(resolve => resolve(this.name))
  }
}

class BaseField extends BaseField1 {
  constructor(name, data) {
    super(name, data)
  }

  _get_readonly(instance) {
    // 仅仅 在 commit 时, 组织 values, 需要
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

  get_for_write(instance) {
    if (this._get_readonly(instance)) {
      return null
    }
    const value = instance._values_to_write[this.name][instance.id]
    if (value === undefined) {
      return null
    }
    return value
  }

  commit(/* instance  */) {
    // only a skeleton, to be overrid for o2m
  }

  after_commit(/* instance  */) {
    // only a skeleton, to be overrid for o2m
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
      // so, sol, invoices
      const storage = instance._values_relation[this.name]
      storage._values = {}
      storage._values_to_write = {}
      storage._values_relation = {}
    }

    if (instance._values_relation2[this.name] === undefined) {
      instance._values_relation2[this.name] = {}
      const storage = instance._values_relation2[this.name]
      storage._values_relation2 = {}
    }
  }

  _get_storage(instance) {
    // const storage = instance._values_relation[this.name] || {}
    const storage = instance._values_relation[this.name]
    return storage
  }

  _get_storage2(instance) {
    // const storage = instance._values_relation[this.name] || {}
    const storage = instance._values_relation2[this.name]
    return storage
  }

  _get_storage_records(instance) {
    const storage = this._get_storage2(instance)
    return storage.records
  }

  _get_env(instance) {
    if (!this.context) {
      return instance.env
    }
    const context = { ...instance.env.context, ...this.context }
    return instance.env.copy(context)
  }

  getValue(instance) {
    const id_ = this.raw_value(instance)
    const Relation = this._get_Relation(instance)
    const env = this._get_env(instance)
    const kwargs = { from_record: [instance, this] }
    return Relation._browse_relation(env, id_ || false, kwargs)
  }

  get_selection(instance, kwargs = {}) {
    // for m2o and m2m.tag
    const { default: default2 } = kwargs
    if (default2) {
      const id_ = instance._values[this.name][instance.id] || false
      if (id_) {
        const Relation = this._get_Relation(instance)
        const env = this._get_env(instance)
        const kwargs = { from_record: [instance, this] }
        const relation = Relation._browse_relation(env, id_, kwargs)
        if (relation.id) {
          return [[relation.id, relation.$display_name]]
        }
      }

      return []
    } else {
      return this.get_selection_async(instance, kwargs)
    }
  }

  async get_selection_async(instance, kwargs = {}) {
    // console.log(' get selection,', instance._name, instance.id, this.name)
    // console.log('get_selection2', this.domain)
    const { name = '', operator = 'ilike', limit = 8, domain, context } = kwargs

    // const domain1 = await instance.eval_safe(this.domain)
    const domain1 = []
    const domain2 = await instance.eval_safe(domain)
    const context2 = await instance.eval_safe(context)

    const args = [...(domain1 || []), ...(domain2 || [])]

    const relation = this.relation
    // ? TBD, 是否 在 context 中, 有 string domain 需要的 values?
    // const context = this.context
    const context3 = context2 || instance.env.context

    const kwargs2 = { args, name, operator, limit, context: context3 }
    const selection = await instance.env
      .model(relation)
      .execute_kw('name_search', [], kwargs2)

    //
    // console.log(' get selection,2 ', selection)

    selection.forEach(value => {
      instance._values_relation[this.name]._values.display_name[value[0]] =
        value[1]
    })

    // console.log(' get selection,2 ', instance)

    return selection
  }

  async new(/*instance*/) {
    // only for o2m
    // console.log('new', instance._name, instance.ids, this.name)
  }
}

class Many2one extends _Relational {
  constructor(name, data) {
    super(name, data)
  }

  _init_storage(instance) {
    super._init_storage(instance)
    const relation_storage = instance._values_relation[this.name]
    if (relation_storage._values.display_name === undefined) {
      relation_storage._values.display_name = {}
    }
  }

  /* Get */

  fetch_one(instance) {
    const values1 = super.fetch_one(instance)
    const value_name = this._fetch_one_valueName(instance)
    const values = { ...values1, [`${this.name}__name`]: value_name }
    return values
  }

  // 返回  m2o display_name
  _fetch_one_valueName(instance) {
    const id_ = this.raw_value(instance)
    if (!id_) {
      return ''
    }

    const storage = this._get_storage(instance)
    const value = storage._values.display_name[id_]
    return value
  }

  _get_Relation(instance) {
    const view_info = {
      fields: { display_name: { type: 'char', string: 'Name', readonly: true } }
    }

    const kwargs = {
      parant_reg_name: instance._reg_name,
      parent: instance.constructor,
      parent_field: this.name,
      isSync: true,
      view_info
    }

    return instance.env.model(this.relation, 'many2one', kwargs)
  }

  // 返回 异步 对象
  async $$getValue(instance) {
    const ids = this.raw_value(instance)
    const Relation = instance.env.model(this.relation)
    const env = this._get_env(instance)
    return Relation._browse(env, ids)
  }

  /* Set */

  // async setValue(instance, value) {
  //   // 首先 要 get selection, 那么 set之后, valueName2 才会有值
  //   // 当然, 没有 selection, 也无法 set value
  //   return super.setValue(instance, value)
  // }

  _set_by_init(instance, record) {
    // 缺省 使用 _classic_read,  m2o 字段 返回 [m2o.id, m2o.display_name]
    // 存储 m2o.id:   this._values[field][row.id] = m2o.id
    // 存储 m2o.name: this._values_relation[field]._values.display_name[m2o.id] = m2o.display_name

    const instance_id = record.id
    const value = record[this.name]

    instance._values[this.name][instance_id] = value ? value[0] : value
    if (value && value[1]) {
      const storage = this._get_storage(instance)
      storage._values.display_name[value[0]] = value[1]
    }
  }

  _set_by_object(instance, object) {
    // 参数 是 [id, name]
    super._set_by_object(instance, object)
    const storage_src = this._get_storage(object)
    const src = storage_src._values.display_name
    const storage_dst = this._get_storage(instance)
    const dst = storage_dst._values.display_name
    storage_dst._values.display_name = { ...dst, ...src }
  }

  _set_by_onchnge(instance, value) {
    // 参数 是 [id, name]
    instance._values_to_write[this.name][instance.id] = value ? value[0] : value
    if (value && value[1]) {
      const storage = this._get_storage(instance)
      storage._values.display_name[value[0]] = value[1]
    }
    instance.event_onchange(this.name)
  }
}

class _RelationalMulti extends _Relational {
  constructor(name, data) {
    super(name, data)
  }

  raw_value(instance) {
    // console.log('m2m, _getValue1 ', instance._name, instance.id, this.name)
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

  fetch_one(instance) {
    const values1 = super.fetch_one(instance)
    const value_records = this._fetch_one_valueRecords(instance)
    const values = { ...values1, [`${this.name}__record`]: value_records }

    return values
  }

  _fetch_one_valueRecords(instance) {
    const relation = this.getValue(instance)
    return relation.fetch_all()
  }

  _set_default(instance) {
    instance._values[this.name][instance.id] = []
  }

  _set_by_object(instance, object) {
    // call super,  to set _values for init
    super._set_by_object(instance, object)
    const storage2_src = this._get_storage2(object)
    const src = storage2_src.records
    if (src) {
      const storage2_dst = this._get_storage2(instance)
      const dst = storage2_dst.records || this.getValue(instance)
      dst._update_from_record(src)
      storage2_dst.records = dst
    }
  }
}

class Many2many extends _RelationalMulti {
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

  _get_Relation(instance) {
    const Relation = instance.env.model(this.relation, 'many2many', {
      parant_reg_name: instance._reg_name,
      parent: instance.constructor,
      parent_field: this.name,
      isSync: true,
      view_info: {
        fields: {
          display_name: { type: 'char', string: 'Name', readonly: true }
        }
      }
    })
    return Relation
  }

  async $$getValue(instance) {
    // m2m 字段, 初始化时, 只有 [ids],

    // 定义 双 $$函数 异步返回 [{id, display_name}]
    // console.log('m2m, $$getValue1', this.name)

    // Relation 为 同步获取, 无需 await Relation.awaiter 等待
    const Relation = this._get_Relation(instance)
    const env = this._get_env(instance)
    const ids = this.raw_value(instance)
    // console.log('m2m, getValue1', this.name, ids)

    const kwargs = { from_record: [instance, this] }
    const relation = await Relation._browse_relation_async(env, ids, kwargs)
    const storage2 = this._get_storage2(instance)
    storage2.records = relation

    // relation.event_onchange_all()

    // console.log('m2m, $$getValue1', this.name)
    instance.event_onchange(this.name)

    return relation
  }

  // TBD 三 $$$ 函数 暂时用不到, 未实现
  async $$$getValue(instance) {
    // console.log('m2m, $$$getValue', this.name)
    const Relation = instance.env.model(this.relation)
    const env = this._get_env(instance)
    const ids = this.raw_value(instance)
    const kwargs = { from_record: [instance, this] }
    const relation = await Relation._browse_relation_async(env, ids, kwargs)
    return relation
  }

  async _setValue(instance, value) {
    // 参数是 [ids]
    //   console.log('m2m set', this.name, value)
    //   // TBD // m2m 如何 set value? // m2m 只有一种编辑方式? 多选框?
    //   // 6, 5, 4, 3
    //   // 初始值 为 (6,0,[])
    //   // 然后 (4,id), (3,id) 去增加和删除
    console.log('m2m set', this.name, value)
    instance._values_to_write[this.name][instance.id] = [[6, 0, [...value]]]
    const relation = this._get_storage_records(instance)
    if (relation) {
      relation._ids = [...value]
    }
  }

  _set_by_onchnge(instance, tuples) {
    // 参数 是 [id, name]
    // instance._values_to_write[this.name][instance.id] = value ? value[0] : value
    // if (value && value[1]) {
    //   const storage = this._get_storage(instance)
    //   storage._values.display_name[value[0]] = value[1]
    // }
    // instance.event_onchange(this.name)

    // sale.order.line, tax_id is m2m
    // onchange 返回的是 [[5]]
    console.log('m2m set', this.name, tuples)

    const new_value = tuples
    const old_value = instance._values_to_write[this.name][instance.id] || []
    const values_to_write = merge_tuples(old_value, new_value)
    console.log('m2m set', this.name, old_value, new_value, values_to_write)

    instance._values_to_write[this.name][instance.id] = values_to_write

    // const storage = instance._values_relation[this.name]
    // if (storage.records) {
    //   const ids = this._getValue1(instance)
    //   storage.records._ids = ids
    // }

    const relation = this._get_storage_records(instance)
    if (relation) {
      const ids = this.raw_value(instance)
      relation._ids = ids
    }

    instance.event_onchange(this.name)
  }
}

class One2many extends _RelationalMulti {
  constructor(name, data) {
    super(name, data)
    this.relation_field = data.relation_field || false
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

  _get_Relation(instance) {
    const view_info = instance._view_info
    const my_views = view_info.fields[this.name].views
    // o2m 一定是使用  tree or kanban view, 不可能是 form view
    // o2m 单行编辑时, 用 tree or form view,
    if (my_views.tree) {
      return instance.env.model(this.relation, 'tree', {
        parant_reg_name: instance._reg_name,
        parent: instance.constructor,
        parent_field: this.name,
        view_info: my_views.tree,
        views: my_views
      })
    } else if (my_views.kanban) {
      return instance.env.model(this.relation, 'kanban', {
        parant_reg_name: instance._reg_name,
        parent: instance.constructor,
        parent_field: this.name,
        view_info: my_views.kanban,
        views: my_views
      })
    } else {
      return instance.env.model(this.relation, 'one2many', {
        parant_reg_name: instance._reg_name,
        parent: instance.constructor,
        parent_field: this.name,
        isSync: true,
        view_info: {
          fields: {
            display_name: { type: 'char', string: 'Name', readonly: true }
          }
        }
      })
    }
  }

  _get_Relation_view_type(instance) {
    const view_info = instance._view_info
    const my_views = view_info.fields[this.name].views
    if (my_views.tree) {
      return 'tree'
    } else if (my_views.kanban) {
      return 'kanban'
    } else {
      return 'one2many'
    }
  }

  async $$getValue(instance, force) {
    // 返回 异步对象
    // o2m 字段, 初始化时, 只有 [ids],
    // 定义 双$$函数 异步返回 [{id, ...}] 字段 由 _field_onchange
    // console.log(' getValue1, ', this.name, this.value(instance))

    // 明面上的 o2m 字段,
    // 初始化时 为 [ids], 首次 getValue1 需要请求服务器
    // 然后暂存 storage.records
    // 之后 新增 / 删除 直接 更新 storage.records.ids, 编辑, 直接 更新 storage.values
    // 故, 之后 使用时只需要 直接取 storage.records
    // 而初始化 发请求的 [ids] 都是真实的 ids

    // 有潜在的 o2m 字段.  event.event 的  event_mail_ids
    //  event.event 的 event_type_id 改变时触发 onchange 返回:
    //  event_mail_ids = [(5,0,0),(0,0,{})]
    //  经过 setValueByOnchange1 函数处理,
    // 数据进入 event.event 的 value_relation

    // 当 event_mail_ids getValue1 时, 此时应该根据  event.event 的 value_relation 的 数据
    // 同步方法, 生成 event_mail_ids 的 storage.records
    // TBD 待处理

    const storage = this._get_storage2(instance)

    if (storage.records && !force) {
      return storage.records
    } else {
      const Relation = this._get_Relation(instance)
      // console.log('getValue1 ', [Relation])
      const env = this._get_env(instance)
      const ids = this.raw_value(instance)
      const kwargs = { from_record: [instance, this] }
      //
      const relation = await Relation._browse_relation_async(env, ids, kwargs)

      storage.records = relation

      relation.event_onchange_all()
      return relation
    }
  }

  //
  // setValue 是异步函数,
  // o2m 字段, 分解为 romove / new
  // o2m 字段 子模型的编辑, 由子模型处理后, 直接 call _setValue1
  // async setValue(instance, value) {
  //   return super.setValue(instance, value)
  // }

  _set_by_tuples(instance, tuples) {
    // 1. 其他字段 onchange 的返回值, 有本字段 o2m 需要设置
    // 2. 子模型 处理完之后, 更新父模型的 o2m 字段, 就是本 o2m 字段

    // call by setValueByOnchange
    // call by remove
    // 这是同步函数
    // 参数是  tuples
    //
    console.log('o2m set', this.name, tuples)

    const new_value = tuples
    const old_value = instance._values_to_write[this.name][instance.id] || []
    const values_to_write = merge_tuples(old_value, new_value)
    console.log('o2m set', this.name, old_value, new_value, values_to_write)

    instance._values_to_write[this.name][instance.id] = values_to_write

    // const storage = instance._values_relation[this.name]
    // if (storage.records) {
    //   const ids = this._getValue1(instance)
    //   storage.records._ids = ids
    // }

    const relation = this._get_storage_records(instance)
    if (relation) {
      const ids = this.raw_value(instance)
      relation._ids = ids
    }

    instance.event_onchange(this.name)
  }

  _set_by_onchnge(instance, tuples) {
    /*
    // _setValue1 的一种
    // 参数是 tuples

    // 1 其他字段 编辑, 触发 onchange之后,
    // 2 返回 我o2m字段的值, [[5,],[6,],[1,id,{}],[0,id,{}]]
    // 3 这个函数, 处理o2m字段的值 更新到自己的模型

    // 一个案例:
    // event.evnt, event_type_id 改变时触发 onchange 返回 event_mail_ids 的值
    // [5,],[6,] 可以直接 call _setValue1
    // [0, 0, {}]
    // [1, id, {}]
    // 编辑情况: [1, id, {}]
    // 根据 id , 更新 value_relation
    // 之后 call _setValue1
    //
    // 新增情况: [0, 0, {}]
    // 创建 id , 更新 value_relation
    // 如果 value_relation 中 有 新增的, 需要先删除?
    //
    // 之后 call _setValue1
    // 目前只有一个例子
    // event.evnt, event_type_id onchange 返回 event_mail_ids
    //
    */

    tuples.forEach(tup => {
      // TBD event.event change event.type 时, 返回的是 全 [0,0,{}]
      // 如果其他情况, TBD
      if (tup[0] === 5) {
        //remove all
        this._set_by_tuples(instance, [tup])
      } else if (tup[0] === 0) {
        // console.log(tup)
        const rel_new = this._set_by_onchnge_get_new(instance, tup[2])
        rel_new._update_parent()
      }
    })

    //

    instance.event_onchange(this.name)
  }

  _set_by_onchnge_get_new(instance, values) {
    console.log('new_sync,TBD,20210425 ', instance._name, this.name, values)
    // throw 'error  new_sync '
    const relation = this.getValue(instance)
    const Relation = this._get_Relation(instance)
    const env = this._get_env(instance)
    const iterated = relation
    const kwargs = { from_record: [instance, this], iterated, values }
    const ids = instance._odoo._get_virtual_id()
    const rel_new = Relation._browse_relation_o2m_new(env, ids, kwargs)
    return rel_new
  }

  // _set_by_object(instance, object) {
  //   // call super,  to set _values for init
  //   super._set_by_object(instance, object)
  //   const storage2_src = this._get_storage2(object)
  //   const src = storage2_src.records
  //   if (src) {
  //     const storage2_dst = this._get_storage2(instance)
  //     const dst = storage2_dst.records || this.getValue(instance)
  //     dst._update_from_record(src)
  //     storage2_dst.records = dst
  //   }
  // }

  /* o2m CRUD */
  async update(instance, relation_updated) {
    console.log('update,', instance._name, this.name, relation_updated)
    const src = relation_updated
    const storage2_dst = this._get_storage2(instance)
    const dst = storage2_dst.records || this.getValue(instance)

    // const storage2_dst = this._get_storage2(instance)
    // const dst = storage2_dst.records || this.getValue(instance)

    if (src.id) {
      dst._update_from_record(src)
      storage2_dst.records = dst
      console.log('update,2', storage2_dst)

      const op = !is_virtual_id(src.id) ? 1 : 0
      const tuples = [[op, src.id, {}]]

      this._set_by_tuples(instance, tuples)
    } else {
      // new
    }

    const set_ok = this._setValue_after(instance)
    instance._instance_awaiters.push(set_ok)
    return set_ok
  }

  async remove(instance, relation_to_remove) {
    // remove is setValue 的一种
    // console.log('remove1:', instance._name, instance.ids, this.name)
    const o2m_id =
      relation_to_remove instanceof Model
        ? relation_to_remove.id
        : relation_to_remove

    const new_value = [[2, o2m_id, 0]]

    this._set_by_tuples(instance, new_value)
    const set_ok = this._setValue_after(instance)
    instance._instance_awaiters.push(set_ok)
    return set_ok
  }

  async new(instance) {
    // new is set value, new a model, onchange, then call _setValue1
    console.log('new', instance._name, instance.ids, this.name)
    // new 是一种 setValue.
    // 1 call default_get, onchange,
    // 2 then call 同步 _setValue1

    // call new 之前, 必定已经  storage.records 是初始化过的
    // call new 之后, 经过 onchange, 最后 call _setValue1

    // const storage = instance._values_relation[this.name]
    // const iterated = storage.records

    const iterated = this._get_storage_records(instance)

    const Relation = this._get_Relation(instance)
    const env = this._get_env(instance)
    const ids = instance._odoo._get_virtual_id()
    const kwargs = { from_record: [instance, this], iterated }

    const new_relation = await Relation._browse_relation_o2m_new(
      env,
      ids,
      kwargs
    )

    // _update_parent

    // 在 onchange 里 更新 parent
    // 同时也触发 callback 返回页面

    // new 时, 相当于 列表变更, 故 全部刷新下
    iterated.event_onchange_all()
    // console.log('new3,', instance._name, instance.ids, this.name)
    return new_relation
  }

  // 以上 ok

  _get_for_CU(instance, value) {
    // console.log(' _get_for_CU,', instance._name, instance.id, this.name)
    if (value === null) {
      return value
    }

    const relation = this._get_storage_records(instance)

    if (!relation) {
      return value
    }

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

  // 什么时候 调用这个函数?
  // remove_one_sync(instance, relation_to_remove) {
  //   const o2m_id =
  //     relation_to_remove instanceof Model
  //       ? relation_to_remove.id
  //       : relation_to_remove

  //   const new_value = [[2, o2m_id, 0]]
  //   this._setValue1(instance, new_value)
  // }

  async after_commit(instance) {
    // create and write commit 之后, then read from odoo
    //  因此数据已经变更, 重新读取 o2m 的数据

    const storage = this._get_storage2(instance)

    if (storage && storage.records) {
      storage.records = null
      await this.getValue(instance)
    }
  }

  commit(instance) {
    const records = this._get_storage_records(instance)
    if (!records) {
      return
    }

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

class Binary extends BaseField {
  constructor(name, data) {
    super(name, data)
  }

  value(instance) {
    // 给 instance  fetch_one1 使用
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

  getValue(instance) {
    const value = super.raw_value(instance)
    return value ? new Date(value) : value
  }

  // setValue ? 应该反转吧?
}

class Datetime extends BaseField {
  constructor(name, data) {
    super(name, data)
  }

  getValue(instance) {
    const value = super.raw_value(instance)
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

  raw_value(instance) {
    const value = super.raw_value(instance)
    return value ? value : 0.0
  }

  _set_default(instance) {
    instance._values[this.name][instance.id] = 0.0
  }
}

class Monetary extends Float {
  constructor(name, data) {
    super(name, data)
  }
}

class Integer extends BaseField {
  constructor(name, data) {
    super(name, data)
    this.selection = data.selection || false
  }

  raw_value(instance) {
    const value = super.raw_value(instance)
    return value ? value : 0
  }

  _set_default(instance) {
    instance._values[this.name][instance.id] = 0
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
    const value_name = this._fetch_one_valueName(instance)
    const values = { ...values1, [`${this.name}__name`]: value_name }
    return values
  }

  _fetch_one_valueName(instance) {
    const value = this.raw_value(instance)
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

// M2m

// M2o

// O2m

class Reference extends BaseField {
  constructor(name, data) {
    super(name, data)
    this.context = data.context || {}
    this.domain = data.domain || false
    this.selection = data.selection || false
  }

  // TBD
  getValue(instance) {
    const value = super.getValue(instance)

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

  _set_default(instance) {
    instance._values[this.name][instance.id] = ''
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
  monetary: Monetary,
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
