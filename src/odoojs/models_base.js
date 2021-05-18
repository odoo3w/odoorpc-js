// Array and Object 注意 使用时, 复制一份
// 1 使用者: 如果本地可能有修改 那么 应该复制一份, 而不是直接使用 旧的
// 2 授权者: 把一个 Array 给了别人, 如果不想被修改, 那么给一个副本, 不要给原件

// const deep_copy = node => {
//   return JSON.parse(JSON.stringify(node))
// }

// NORMALIZED_TYPES = (int, str, bytes)

// const FIELDS_RESERVED = ['id', 'ids', '__odoo__', '__osv__', '__data__', 'env']

const _normalize_ids = ids => {
  if (!ids) {
    return []
  }

  if (Array.isArray(ids)) {
    return [...ids]
  }

  return [ids]
}

export const is_virtual_id = id_ => {
  return typeof id_ === 'string' && id_.slice(0, 8) === 'virtual_'
}

export class IncrementalRecords {
  // """A helper class used internally by __iadd__ and __isub__ methods.
  // Afterwards, field descriptors can adapt their behaviour when an instance of
  // this class is set.
  // """
  constructor(tuples) {
    this.tuples = tuples
  }
}

class BaseModel {
  constructor() {
    // 定义 迭代方法
    this[Symbol.iterator] = () => {
      let index = 0
      const that = this
      return {
        next() {
          const one = that.iterator_next(index)
          if (one === undefined) {
            return { value: undefined, done: true }
          } else {
            index++
            return { value: one, done: false }
          }
        }
      }
    }
  }

  static get env() {
    return this._env
  }

  get env() {
    return this.constructor._env
  }

  get _odoo() {
    return this.constructor._odoo
  }

  get _name() {
    return this.constructor._name
  }

  get _columns() {
    return this.constructor._columns
  }

  iterator_next(/*index*/) {
    // to be rewrite by child
  }
}

// to be set by child
BaseModel._env = undefined
BaseModel._odoo = undefined
BaseModel._name = undefined
BaseModel._columns = {}

class BaseModel2 extends BaseModel {
  constructor() {
    super()
    this._env_local = null
    this._ids = []
    this._view = {}
  }

  iterator_next(index) {
    if (index < this.ids.length) {
      // 这种 迭代 切片 不用于 页面展示, 只用于 内部处理, 因此 这里用不到 fetch_one, callback
      return this.constructor._browse_iterated(this.env, this.ids[index], {
        iterated: this
      })
    } else {
      return undefined
    }
  }

  get env() {
    return this._env_local ? this._env_local : this.constructor._env
  }

  get id() {
    return this._ids.length ? this._ids[0] : null
  }

  get ids() {
    return this._ids
  }

  // TBD. check if used
  // get _field_onchange() {
  //   return this._view._field_onchange
  // }

  get field_onchange() {
    return this._view._field_onchange
  }

  static with_context(context, kwargs = {}) {
    const context2 = context ? context : this.env.context
    const context3 = { ...context2, ...kwargs }
    return this.with_env(this.env.copy(context3))
  }

  async with_context(context, kwargs = {}) {
    const context2 = context ? context : this.env.context
    const context3 = { ...context2, ...kwargs }
    return this.with_env(this.env.copy(context3))
  }

  static with_env(env) {
    const CLS = this
    class Cls extends CLS {
      constructor() {
        super()
      }
    }

    Cls._env = env
    return Cls
  }

  // TBD
  async with_env(env) {
    // env, context 改变以后, 比如 lang, value 会改变
    // 因此 with_context 之后, 应该就是一个 全新的 model
    const res = this.constructor._browse(env, this.ids)
    return res
  }

  event_onchange(field_name) {
    // console.log('xxx, event_onchange :', [
    //   this._name,
    //   field_name,
    //   this._callback_onchange
    // ])

    if (this._callback_onchange) {
      const values = this.fetch_one()
      this._callback_onchange(values, field_name)
    }
  }

  event_onchange_all() {
    if (this._callback_onchange_all) {
      // o2m 的  _callback_onchange_all
      // 与  主页面 tree view 的 _callback_onchange_all
      this._callback_onchange_all()
    }
  }

  fetch_all() {
    // console.log('fetch_all', this._name, this.ids, this._fields, this)
    return this.ids.map(id_ => this._getById(id_).fetch_one())
  }

  fetch_one() {
    const acc_init = { id: this.id }
    return this._fields.reduce((acc, col) => {
      const meta = this._columns[col]
      acc = { ...acc, ...meta.fetch_one(this) }
      return acc
    }, acc_init)
  }

  // magic method for odoo

  /*
  __getattr__
  js 里非常不容易实现 __getattr__
  这里代替解决方案是:
  1 odoo.models.Model 的 基本方法, 这里明文声明函数, 如 create, read, search, onchange 等
  2 这里有 execute, execute_kw 函数, 可以调用 未定义的 method
  3 各自模型里 自定义的 方法, 使用 execute, execute_kw 间接调用
  4 考虑 做 addons, 自定义 常用 model
  */

  // 切片方法, 等同于 __getitem__
  getByIndex(index, kwargs = {}) {
    const index2 = index >= 0 ? index : this.ids.length + index
    if (index2 >= 0 && index2 < this.ids.length) {
      const id_ = this.ids[index2]
      return this.getById(id_, kwargs)
    } else {
      // error
      return undefined
    }
  }

  _getById(id_) {
    // 纯切片, 内部使用, 不触发 onchange
    return this.constructor._browse_iterated(this.env, id_, {
      iterated: this
    })
  }

  getById(id_, kwargs = {}) {
    if (this.ids.includes(id_)) {
      const { fetch_one } = kwargs
      const payload = { iterated: this, fetch_one }
      const res = this.constructor._browse_iterated(this.env, id_, payload)
      // 按照约定, 切片后, 要触发 callback, 返回数据
      // 切片函数 被页面调用时, 不能触发 event_onchange,
      // 因为 页面会 循环刷新
      // res.event_onchange()

      return res
    } else {
      // error if id not in ids
      return undefined
    }
  }

  // 这个函数 废弃不用了 2021-3-13
  // slice(start, end) {
  //   const end2 = end || start + 1
  //   const new_ids = this.ids.slice(start, end2)
  //   const res = this.constructor._browse_iterated22(this.env, new_ids, this)
  //   return res
  // }

  // __init__ ?

  // __eq__ 相等

  // __ne__ 不相等

  // 迭代 __iter__
  // 在构造函数中实现

  // __nonzero__ 非空
  get isNotNull() {
    return this.ids.length ? true : false
  }

  // 长度
  get length() {
    return this.ids.length
  }

  // __iadd__

  // __isub__

  //
  // odoo api
  //

  static async execute_kw(method, args = [], kwargs = {}) {
    const kwargs2 = { ...kwargs }

    if (!Object.keys(kwargs).includes('context')) {
      kwargs2.context = this.env.context
    }

    return this._odoo.execute_kw(this._name, method, args, kwargs2)
  }

  static async execute(method, ...args) {
    return this.execute_kw(method, args, {})
  }

  async execute_kw(method, args = [], kwargs = {}) {
    const kwargs2 = { ...kwargs }
    if (!Object.keys(kwargs).includes('context')) {
      kwargs2.context = this.env.context
    }
    return this.constructor.execute_kw(method, [this.ids, ...args], kwargs2)
  }

  async execute(method, ...args) {
    return this.execute_kw(method, [...args], {})
  }

  static async read(ids, fields, kwargs) {
    const method = 'read'
    return this.execute_kw(method, [ids, fields], kwargs)
  }

  async read(fields, kwargs) {
    const method = 'read'
    return this.execute_kw(method, [fields], kwargs)
  }

  async write(vals) {
    return this.constructor.write(this.id, vals)
  }

  static async write(rid, vals) {
    const method = 'write'
    return this.execute(method, rid, vals)
  }

  async unlink() {
    const method = 'unlink'
    return this.execute(method)
  }

  static async unlink(rid) {
    const method = 'unlink'
    return this.execute(method, rid)
  }

  static async create(vals) {
    return this.execute('create', vals)
  }

  static async search(domain, kwargs = {}) {
    return this.execute_kw('search', [domain], kwargs)
  }

  static async web_search_read(kwargs = {}) {
    return this.execute_kw('web_search_read', [], kwargs)
  }

  static async fields_view_get(kwargs = {}) {
    const { view_id, view_type = 'form', view_ref } = kwargs
    const context = {
      ...this.env.context,
      ...(view_ref ? { [`${view_type}_view_ref`]: view_ref } : {})
    }

    const kwargs2 = { view_id, view_type, context }
    return this.execute_kw('fields_view_get', [], kwargs2)
  }

  async action_load(action_id) {
    // const Action = this.env.model('ir.ac')
    console.log('call_action ', action_id)

    const additional_context = {
      ...this.env.context,
      allowed_company_ids: [...this._odoo.allowed_company_ids],
      active_id: this.id,
      active_ids: [...this.ids],
      active_model: this._name
    }

    const action = await this.env.action(action_id, additional_context)

    return action

    // allowed_company_ids
    // console.log('call_action ', action_id, additional_context)

    // this._odoo.action_load(action_id, additional_context)
  }

  // static async search_or_create(domain, vals) {
  //   const ids = await this.search(domain, { limit: 1 })
  //   if (ids.length) {
  //     return this.browse(ids[0], {view_ref: 'xml_id'})
  //   } else {
  //     // return this.create(vals)
  //   }
  // }

  static async default_get(fields) {
    return this.execute('default_get', fields)
  }

  static async name_get(ids) {
    return this.execute('name_get', ids)
  }

  /* onchange  */

  async _onchange2(values, field_name, field_onchange) {
    // console.log('_onchange2, ', this._name, this.id, field_name)

    const session_info = this._odoo.session_info
    const server_version_info = session_info.server_version_info
    const version = server_version_info[0]
    const is_call_default =
      (!field_name || (Array.isArray(field_name) && !field_name.length)) &&
      version == 13

    if (is_call_default) {
      const onchange = await this._default_get_onchange(values, field_onchange)
      return onchange
    }
    console.log('_onchange2,1, ', this._name, this.id, field_name)

    if (!this.id || is_virtual_id(this.id)) {
      const asrgs = [[], values, field_name, field_onchange]
      const onchange = await this.constructor.execute('onchange', ...asrgs)
      return onchange
    } else {
      const asrgs = [values, field_name, field_onchange]
      // console.log('_onchange2,12, ', this._name, this.id, field_name)
      const onchange = await this.execute('onchange', ...asrgs)
      console.log('_onchange2,13, ', this._name, this.id, field_name, onchange)
      return onchange
    }
  }

  // call by _onchange2
  // TBD: default_get 里面 可能有 m2o o2m 需要处理
  async _default_get_onchange(values = {}, field_onchange = {}) {
    const fields = Object.keys(field_onchange).filter(
      fld => fld.split('.').length === 1
    )

    // console.log('_default_get_onchange', this._name, field_onchange, fields)

    const default_get1 = await this.constructor.execute('default_get', fields)

    // console.log('default get ', default_get1)

    const _get_default = col => {
      const meta = this._columns[col]

      if (['many2many'].includes(meta.type)) {
        return [[6, false, []]]
      } else if (['one2many'].includes(meta.type)) {
        return []
      } else if (['float', 'integer', 'monetary'].includes(meta.type)) {
        return 0
      } else if (['text', 'html'].includes(meta.type)) {
        return ''
      }
      return false
    }

    const values_onchange2 = fields.reduce((acc, cur) => {
      acc[cur] = _get_default(cur)
      return acc
    }, {})

    const values_onchange = { ...values_onchange2, ...values, ...default_get1 }

    if (this._from_record) {
      const [parent, field] = this._from_record
      const parent_vals = parent._get_values_for_onchange({ for_parent: true })
      values_onchange[field.relation_field] = parent_vals
    }

    const field_name = fields
    const args = [[], values_onchange, field_name, field_onchange]
    const onchange = await this.constructor.execute('onchange', ...args)

    // console.log('default get 2', onchange)

    // # TBD: default_get 里面 可能有 m2o o2m 需要处理
    // default_get, m2o 返回值 是 id, 需要 补充上 display_name
    const default_get2 = {}

    for (const col of Object.keys(default_get1)) {
      const meta = this._columns[col]
      if (meta.relation && meta.type === 'many2one') {
        const ref_val = default_get1[col]

        if (ref_val) {
          const ref_ids = Array.isArray(ref_val) ? ref_val : [ref_val]
          const domain = [['id', 'in', ref_ids]]
          const ref_records = await this.env
            .model(meta.relation)
            .execute_kw('name_search', [], { args: domain })

          const ref_rec = ref_records[0]

          default_get2[col] = [...ref_rec]
        } else {
          default_get2[col] = default_get1[col]
        }
      } else {
        default_get2[col] = default_get1[col]
      }
    }

    const values_ret = { ...values, ...default_get2, ...onchange.value }
    const onchange2 = { ...onchange, value: values_ret }

    // console.log('default get 3', onchange2)

    return onchange2
  }

  _get_values_for_onchange(payload = {}) {
    const { for_parent, for_relation } = payload
    const columns = Object.keys(this.field_onchange).filter(
      fld => fld.split('.').length === 1
    )

    // const vals_init = this.id && !for_relation ? { id: this.id } : {}

    const check_is_to_append = () => {
      if (!this.id || is_virtual_id(this.id)) {
        return false
      }
      if (for_relation) {
        return false
      }
      return true
    }

    let vals_init = {}
    if (check_is_to_append()) {
      vals_init.id = this.id
    }

    const vals = columns.reduce(
      (acc, field) => {
        acc[field] = this._columns[field].get_for_onchange(this, for_parent)
        return acc
      },
      { ...vals_init }
    )

    return vals
  }

  async trigger_onchange(field_name) {
    // console.log('trigger_onchange,11 ', this._name, this.id, field_name)

    if (!this.field_onchange) {
      return
    }

    // 分步 处理, 不需要 先 更新 parent
    // if (this._from_record) {
    //   // 1st, o2m update2 parent. so, value for onchange with parent
    //   // console.log('trigger_onchange,22 ', this._name, this.id, field_name)
    //   this._update_parent1()
    // }

    if (field_name && !this.field_onchange[field_name]) {
      return
    }

    const values = this._get_values_for_onchange()

    if (this._from_record) {
      // 2nd, parent value in values_for_onchange, with o2m value. this is why 1st _update_parent1
      const [parent, field] = this._from_record
      const parent_vals = parent._get_values_for_onchange({ for_parent: true })
      values[field.relation_field] = parent_vals
    }

    // console.log(values)

    // 3rd, onchange
    const args = [values, field_name, this.field_onchange]
    // console.log('trigger_onchange,12 ', this._name, this.id, field_name)
    const onchange = await this._onchange2(...args)
    // console.log('trigger_onchange,13 ', this._name, this.id, field_name)

    // 4th, update2 values_to_write
    // console.log('trigger_onchange,14 ', this._name, this.id, field_name)
    await this._after_onchange(onchange)
    // console.log('trigger_onchange,15 ', this._name, this.id, field_name)

    // 分步 处理, 处理过 子模型后, 手工 触发 _update_parent1
    // 5th parent trigger onchange
    // if (this._from_record) {
    //   const [parent, field] = this._from_record
    //   const name2 = `${field.name}.${field_name}`
    //   if (parent.field_onchange[name2]) {
    //     await parent.trigger_onchange(field.name)
    //   }
    // }

    return field_name
  }

  //  TBD domain
  async _after_onchange(onchange) {
    //
    // const onchange_domain = onchange.domain || {}
    // TBD domain
    //

    console.log(' after onchange,', onchange)
    // console.log('xxxx,', onchange)
    const onchange_value = onchange.value

    Object.keys(onchange_value).forEach(field => {
      // console.log('after onchange,', field)
      const meta = this._columns[field]
      const val = onchange_value[field]
      meta._set_by_onchnge(this, val)
    })
  }

  async trigger_parent_onchange() {
    if (!this._from_record) {
      return
    }

    this._update_parent()
    const [parent, field] = this._from_record
    await parent.trigger_onchange(field.name)
  }

  _update_parent() {
    // call before onchange and after onchange
    console.log('_update_parent1, 1')
    if (!this._from_record) {
      return
    }
    console.log('_update_parent1, 2')
    const [parent, field] = this._from_record

    const values = Object.keys(this._values_to_write).reduce((acc, fld) => {
      if (this._values_to_write[fld][this.id] !== undefined) {
        acc[fld] = this._values_to_write[fld][this.id]
      }
      return acc
    }, {})
    console.log('_update_parent1, 3')

    // 根据 id 判断 是新增或编辑 [0,id, {}] 或 [1, id, {}]
    const op = !is_virtual_id(this.id) ? 1 : 0
    const tuples = [[op, this.id, values]]
    // 更新 parent的 o2m 字段
    // 需要组织  values 的值 TBD
    field._set_by_tuples(parent, tuples)
  }

  /* commit  */

  _get_values_for_create() {
    // console.log(this._name, this._values)
    return Object.keys(this._values).reduce((acc, fld) => {
      const value = this._columns[fld].get_for_create(this)
      if (value !== null) {
        acc[fld] = value
      }
      return acc
    }, {})
  }

  _get_values_for_write() {
    return Object.keys(this._values_to_write).reduce((acc, fld) => {
      const value = this._columns[fld].get_for_write(this)
      if (value !== null) {
        acc[fld] = value
      }
      return acc
    }, {})
  }

  // call by commit
  async _commit_create() {
    await this.awaiter
    const vals = this._get_values_for_create()
    if (!vals) {
      return true
    }

    const id_ = await this.constructor.create(vals)
    if (!id_) {
      return id_
    }

    Object.keys(this._values).forEach(fld => {
      delete this._values[fld][this.id]
      if (this._values_to_write[fld][this.id] !== undefined) {
        delete this._values_to_write[fld][this.id]
      }
      this._columns[fld].commit(this)
    })

    this._ids = [id_]
    await this._after_commit()
    return id_
  }

  // call by commit
  async _commit_write() {
    await this.awaiter

    const vals = this._get_values_for_write()
    console.log(' _commit_write,', vals)

    if (!vals) {
      return true
    }

    const res = await this.write(vals)
    if (!res) {
      return res
    }

    Object.keys(this._values_to_write).forEach(fld => {
      if (this._values_to_write[fld][this.id] !== undefined) {
        delete this._values_to_write[fld][this.id]
      }
      this._columns[fld].commit(this)
    })

    await this._after_commit()
    return res
  }

  async _after_commit() {
    await this._init_values()
    for (const col of this._fields) {
      await this._columns[col].after_commit(this)
    }
    this.event_onchange()
  }

  async commit() {
    if (this.id) {
      return this._commit_write()
    } else {
      return this._commit_create()
    }
  }
}

class RootModel extends BaseModel2 {
  constructor() {
    super()
  }

  _constructor_init(payload) {
    const { fields, view } = payload
    const { storage, from_record } = payload
    const { fetch_one, fetch_all } = payload

    const records = this

    records._fields = fields || []
    records._view = view

    records._from_record = from_record

    records._values = storage._values || {}
    records._values_to_write = storage._values_to_write || {}
    records._values_relation = storage._values_relation || {}
    records._values_relation2 = storage._values_relation2 || {}

    // TBD 这里是否只需要 fields 即可, 无需 _columns 全字段
    // const fields2 = fields
    const fields2 = this.constructor._columns
    //
    Object.keys(fields2).forEach(field => fields2[field]._init_storage(records))

    // main read, set callback
    records._callback_onchange = fetch_one
    records._callback_onchange_all = fetch_all
  }

  static _browse_iterated(env, ids, payload = {}) {
    // 切片 仅仅是切片, 不用于显示 form view,  显示 form view 通过 this._view,  异步获取
    const { iterated } = payload

    const records = new this()

    records._env_local = env
    records._ids = _normalize_ids(ids)

    // 切片 后, 原本 有 callback_all, so define callbak for each record
    // 如果是切片 1个以上? 目前 only call by getById1, getByIndex, 只有一个 切片
    const fetch_one =
      records._ids.length === 1
        ? () => iterated.event_onchange_all()
        : undefined

    const to_payload = {
      fields: iterated._fields,
      view: iterated._view,
      storage: {
        _values: iterated._values,
        _values_to_write: iterated._values_to_write,
        _values_relation: iterated._values_relation,
        _values_relation2: iterated._values_relation2
      },

      from_record: iterated._from_record,
      fetch_one,
      fetch_all: iterated._callback_onchange_all
    }

    records._constructor_init(to_payload)

    return records
  }

  static async _view_get(payload = {}) {
    const { view, view_type = 'form', view_ref } = payload

    if (view) {
      return view
    }

    if (view_type && view_ref) {
      return this.env.view_get({ view_type, view_ref, Model: this })
    }

    if (this._default_view[view_type]) {
      return this._default_view[view_type]
    }

    const default_view = await this.env.view_get({ view_type, Model: this })
    this._default_view[view_type] = default_view

    return default_view
  }

  static async search_browse(payload = {}) {
    const { fields: fields2, view: view2 } = payload
    const { view_type = 'tree', view_ref } = payload

    const view = await this._view_get({ view: view2, view_type, view_ref })
    const fields = fields2 || Object.keys(view._fields)
    await this.update(fields)
    const records = new this()

    records._env_local = this.env

    const to_payload = { ...payload, view, fields, storage: {} }
    records._constructor_init(to_payload)

    const payload2 = { ...payload }
    delete payload2.view
    const result = await records._init_values_by_search(payload2)

    records._ids = result.records.map(item => item.id)
    view.search_callback(result)

    return records
  }

  static async browse(ids, payload) {
    // 主页页面 调用, tree view / form view (read / edit / new)
    // form_view or tree_view
    // new
    // console.log('xxx, browse:', this._name, ids, payload)

    if (ids === undefined) {
      throw 'call browse without ids'
    }

    return await this._browse_async(this.env, ids, payload)
  }

  // form view button call 之后, call this to 刷新页面
  async browse_flash() {
    await this._init_values()
    for (const col of this._fields) {
      await this._columns[col].browse_flash(this)
    }
    this.event_onchange()
  }

  static async _browse_async(env, ids, payload = {}) {
    const { fields: fields2, view: view2 } = payload
    const { view_type = 'form', view_ref } = payload
    const view = await this._view_get({ view: view2, view_type, view_ref })
    const fields = fields2 || Object.keys(view._fields)

    await this.update(fields)

    const records = new this()

    records._env_local = env
    records._ids = _normalize_ids(ids)

    const to_payload = { ...payload, view, fields, storage: {} }
    records._constructor_init(to_payload)

    if (ids) {
      await records._init_values()
    } else {
      await records._init_values_by_new()
    }

    // 按照约定, browse后, 要触发 callback, 返回数据
    records.event_onchange()
    records.event_onchange_all()

    return records
  }

  /*  init values  */

  _update_from_record(record) {
    console.log('update_from_record, 1')
    this._ids = Array.from(new Set([...this.ids, ...record.ids]))
    Object.keys(this._columns).forEach(field =>
      this._columns[field]._set_by_object(this, record)
    )
    return
  }

  _init_values_by_values(values) {
    Object.keys(this._values).forEach(field_name => {
      this._columns[field_name]._set_default(this)
    })

    Object.keys(values).forEach(field => {
      const meta = this._columns[field]
      const val = values[field]
      meta._set_by_onchnge(this, val)
    })
  }

  _init_values_get_fields() {
    const columns = this.constructor._columns
    const basic_fields = this._fields
      .filter(field_name => field_name !== 'id')
      .filter(field_name => columns[field_name].type !== 'binary')
    return basic_fields
  }

  _init_values_set_fields(result) {
    const columns = this.constructor._columns

    result.forEach(row => {
      Object.keys(row).forEach(field_name => {
        if (field_name !== 'id') {
          const meta = columns[field_name]
          meta._set_by_init(this, row)
        }
      })
    })
  }

  async _init_values_by_search(payload = {}) {
    const { context = this.env.context } = payload
    const fields = this._init_values_get_fields()
    const payload2 = { ...payload, fields, context }
    const result = await this.constructor.web_search_read({ ...payload2 })
    // console.log(result)
    this._init_values_set_fields(result.records)

    return result
  }

  async _init_values(payload = {}) {
    if (!this.ids.length) {
      return
    }

    const fields = this._init_values_get_fields()
    const { context = this.env.context } = payload
    const result = await this.read(fields, {
      context
      // load: '_classic_read'
      // load: '_classic_write'
    })
    // 缺省 使用 _classic_read,  m2o 字段 返回 [m2o.id, m2o.display_name]
    // 缺省 使用 _classic_read,  x2m 字段 返回 [ids]

    // console.log(deep_copy(result))
    this._init_values_set_fields(result)
  }

  async _init_values_by_new(/* payload = {} */) {
    // console.log('xxx, _init_values_for_new_call_onchange1 1:', this._name)
    // const { context = this.env.context } = payload
    Object.keys(this._values).forEach(field_name => {
      this._columns[field_name]._set_default(this)
    })

    const onchange = await this._onchange2({}, [], this.field_onchange)
    await this._after_onchange(onchange)
  }
}

class RelationModel extends RootModel {
  constructor() {
    super()
  }

  async new() {
    //  o2m new, to be check
    if (!this._from_record) {
      return null
    }

    const [parent, field] = this._from_record
    return field.new(parent)
  }

  async remove(record) {
    //  o2m del, to be check
    if (!this._from_record) {
      return null
    }
    const [parent, field] = this._from_record
    return field.remove(parent, record)
  }

  async update(record) {
    if (!this._from_record) {
      return
    }
    const [parent, field] = this._from_record
    return field.update(parent, record)
  }

  static _browse_relation(env, ids, payload = {}) {
    // 这个返回一个 空 壳子 record
    const records = new this()
    records._env_local = env
    records._ids = _normalize_ids(ids)

    const { from_record } = payload
    const [parent, field] = from_record
    const storage = parent._values_relation[field.name]
    const storage2 = parent._values_relation2[field.name]

    const to_payload = {
      ...payload,
      storage: {
        _values: storage._values,
        _values_to_write: storage._values_to_write,
        _values_relation: storage._values_relation,
        _values_relation2: storage2._values_relation2
      }
    }

    records._constructor_init(to_payload)

    return records
  }

  // m2m, o2m, async read
  static async _browse_relation_async(env, ids, payload = {}) {
    const { from_record } = payload
    const [parent, field] = from_record

    const fetch_all = parent._callback_onchange
      ? () => parent.event_onchange(field.name)
      : undefined

    const records = this._browse_relation(env, ids, { ...payload, fetch_all })

    await records._init_values()
    records.event_onchange_all()

    return records
  }

  static _browse_relation_o2m_new(env, ids, payload = {}) {
    // o2m new
    const { iterated } = payload
    const fetch_one = iterated._callback_onchange_all
      ? () => iterated.event_onchange_all()
      : undefined

    const records = this._browse_relation(env, ids, { ...payload, fetch_one })

    const { values } = payload
    if (values) {
      // 使用 已有的 values 进行初始化数据
      records._init_values_by_values(values)
      return records
    } else {
      const call_async = async () => {
        await records._init_values_by_new()
        return records
      }
      return call_async()
    }
  }

  async browse_form_by_relation_tree(row_id, payload = {}) {
    // o2m, from tree view, clicked, to open form view
    const { editable } = payload
    const action = this._view._action
    const view = action.get_view('form')
    const fields = Object.keys(view.fields)

    if (editable) {
      const from_record = this._from_record

      const records = new view.Model()
      records._env_local = this.env

      const ids = row_id || this._odoo._get_virtual_id()
      records._ids = _normalize_ids(ids)

      const to_payload = { ...payload, storage: {}, from_record, fields, view }
      records._constructor_init(to_payload)

      if (row_id) {
        const old = this.getById(row_id)
        records._update_from_record(old)
        console.log('browse_form_by_relation_tree,', old, records)
      } else {
        await records._init_values_by_new()
      }

      records.event_onchange()

      return records
    } else {
      return view.Model.browse(row_id, { ...payload, fields, view })
    }
  }
}

export class Model extends RelationModel {
  constructor() {
    super()
  }

  get view_node() {
    return this._view.view_node || {}
  }

  get _view_type() {
    return this._view._view_type || {}
  }

  get _view_info() {
    return this._view._view_info || {}
  }

  get _model_id() {
    return this.constructor._model_id
  }

  get_selection(field, payload) {
    // console.log('get_selection', field, payload)
    const meta = this._columns[field]
    return meta.get_selection(this, payload)
  }

  static compute_domain(domain_in, record, debug) {
    if (!Array.isArray(domain_in)) {
      return domain_in
    }
    const domain = [...domain_in]

    const AND = (v1, v2) => {
      // console.log('AND', v1, v2)
      if (debug) {
        return v1 * v2
      } else {
        const val1 = compute_condition(v1)
        const val2 = compute_condition(v2)

        return val1 && val2
      }
    }
    const OR = (v1, v2) => {
      // console.log('OR', v1, v2)
      if (debug) {
        return v1 + v2
      } else {
        const val1 = compute_condition(v1)
        const val2 = compute_condition(v2)
        return val1 || val2
      }
    }
    const NOT = v1 => {
      // console.log('NOT', v1)
      if (debug) {
        return -v1
      } else {
        return !v1
      }
    }

    const OPTIONS = { '&': AND, '|': OR, '!': NOT }

    // let index = 0

    const EQU = (val1, val2) => {
      // console.log('EQU', val1, ',', val2)

      if (!Array.isArray(val1)) {
        return val1 === val2
      }

      if (val1.length === 0 && val2.length === 0) {
        return true
      } else if (val1.length !== val2.length) {
        return false
      }
      //
      throw 'TBD: EQU, array'
    }

    const IN = (val1, val2) => {
      // console.log('IN', val1, ',', val2)
      const ret = val2.includes(val1)
      // console.log('IN', ret)
      return ret
    }

    const compute_condition = condition => {
      if (!Array.isArray(condition)) {
        return condition
      }
      //
      const [field, op, val] = condition
      // console.log('xxxx', field, record[field], op, val)
      const val1 = record[field]
      switch (op) {
        case '=':
        case '==':
          return EQU(val1, val)
        case '!=':
        case '<>':
          // if(field===''){
          //   //
          // }

          return !EQU(val1, val)
        case '<':
          return val1 < val
        case '>':
          return val1 > val
        case '<=':
          return val1 <= val
        case '>=':
          return val1 >= val
        case 'in':
          return IN(val1, val)
        case 'not in':
          return !IN(val1, val)
        // case 'like':
        // // return (fieldValue.toLowerCase().indexOf(this._data[2].toLowerCase()) >= 0);
        // case '=like':
        // // var regExp = new RegExp(this._data[2].toLowerCase().replace(/([.\[\]\{\}\+\*])/g, '\\\$1').replace(/%/g, '.*'));
        // // return regExp.test(fieldValue.toLowerCase());
        // case 'ilike':
        // // return (fieldValue.indexOf(this._data[2]) >= 0);
        // case '=ilike':
        // return new RegExp(this._data[2].replace(/%/g, '.*'), 'i').test(fieldValue);
        default:
          throw 'error'
        // throw new Error(_.str.sprintf(
        //     "Domain %s uses an unsupported operator",
        //     this._data
        // ));
        //
      }
    }

    const fn = (domain, op) => {
      // console.log('1st:index:', index, domain, op)
      // index = index + 1
      if (!domain.length) {
        return [null]
      } else if (op.length === 0 && domain.length === 1) {
        const val = domain[0]
        const val2 = compute_condition(val)
        return [val2]
        // return domain
        // const val = domain[0]
        // if (val === true || val === false) {
        //   console.log('all ret,', domain)
        //   return domain
        // }
      }

      const one = domain.shift()
      if (['&', '|', '!'].includes(one)) {
        // console.log('2.1, &|!:', domain, op, one)
        op.push(one)
        const ret = fn(domain, op)
        // console.log('2.1,&|!,1:', domain, op)
        // console.log('2.1,&|!,ok:', ret)
        return ret
      } else {
        // console.log('2.2:', domain, op, one)
        if (op.length === 0) {
          // op not(!&|)  and domain >1
          // console.log('4 default &', domain, op, one)
          op.push('&')
          op.push(one)
          // console.log('4 default & 1', domain, op)
          const dm2 = fn(domain, op)
          // console.log('4 default & ok', dm2, op)
          return dm2
          // return fn(dm2, op)
        } else {
          // console.log('3 comp:', domain, op, one)
          const comp = op[op.length - 1]
          if (comp === '!') {
            // console.log('3.1 !,:', domain, op, one)
            op.pop()
            const ret = NOT(one)
            // console.log('3.1 !,ok:', [ret, ...domain], op)
            return fn([ret, ...domain], op)
          } else if (comp === '&' || comp === '|') {
            op.push(one)
            return fn(domain, op)
          } else {
            // console.log('3.2 &|,:', domain, op, one)
            const v1 = op.pop()
            const c0 = op.pop()
            const ret = OPTIONS[c0](v1, one)
            // console.log('3.2 &|,ok:', [ret, ...domain], op)
            return fn([ret, ...domain], op)
          }
        }
      }
    }

    const ret = fn(domain, [])

    const ret2 = ret[0]

    // console.log('all,ok', ret2)

    return ret2
  }

  compute_domain(domain_in, dataDict) {
    // const record = this.fetch_one()
    const record = dataDict || this.fetch_one()

    return this.constructor.compute_domain(domain_in, record)
  }

  _view_required(node, dataDict) {
    if (!node.attrs) {
      return null
    }
    if (!node.attrs.modifiers) {
      return null
    }
    const modifiers = JSON.parse(node.attrs.modifiers)
    // console.log(node.attrs.name, modifiers)
    if (modifiers.required !== undefined) {
      const required = this.compute_domain(modifiers.required, dataDict)
      return required
    } else {
      return null
    }
  }

  _view_readonly(node, dataDict) {
    if (!node.attrs) {
      return null
    }

    if (!node.attrs.modifiers) {
      return null
    }

    const modifiers = JSON.parse(node.attrs.modifiers)

    if (modifiers.readonly !== undefined) {
      const readonly = this.compute_domain(modifiers.readonly, dataDict)

      return readonly
    } else {
      return null
    }
  }

  _view_invisible(node, dataDict) {
    if (!node.attrs) {
      return false
    }

    if (node.attrs.invisible) {
      return node.attrs.invisible ? true : false
    }

    if (!node.attrs.modifiers) {
      return null
    }

    const modifiers = JSON.parse(node.attrs.modifiers)

    if (modifiers.invisible !== undefined) {
      const invisible = this.compute_domain(modifiers.invisible, dataDict)
      return invisible
    } else {
      return null
    }
  }

  eval_safe(value_str) {
    /*
  // # 仅被 get_selection1 使用

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
      const session_info = this._odoo.session_info
      // # company_id = session_info['company_id']
      const user_companies = session_info.user_companies
      const current_company = user_companies.current_company[0]
      // # allowed_companies = user_companies['allowed_companies']
      // # allowed_company_ids = [com[0] for com in allowed_companies]
      return current_company
    }

    const _get_values_for_domain = () => {
      // const globals_fields = Globals_Dict

      // console.log('globals_fields,xxxxxx', this._name, this)
      // // console.log('globals_fields', instance.field_onchange)
      // const values2 = instance.fetch_one1()

      const globals_fields = this._fields

      const values = globals_fields.reduce((acc, col) => {
        const meta = this._columns[col]
        if (meta) {
          // console.log('vsls', col, meta)
          if (meta.type !== 'many2many' && meta.type !== 'one2many') {
            acc[col] = meta.raw_value(this)
          }
        }
        return acc
      }, {})

      if (!values.company_id) {
        values.company_id = _get_company_id()
      }
      if (this._from_record) {
        const parent = this._from_record[0]
        const p_vals = parent._fields.reduce((acc, col) => {
          const meta = parent._columns[col]
          if (meta) {
            if (meta.type !== 'many2many' && meta.type !== 'one2many') {
              // console.log('vsls', col, meta)
              acc[col] = meta.raw_value(parent)
            }
          }
          return acc
        }, {})

        values.parent = p_vals
      }

      return values
    }

    const domain = value_str || false

    if (domain && typeof domain === 'string') {
      const values = _get_values_for_domain()

      const globals_dict = {
        res_model_id: this._model_id,
        allowed_company_ids: this._odoo.allowed_company_ids,
        ...values
      }

      if (!is_virtual_id(this.id)) {
        globals_dict.active_id = this.id
      }

      const domain2 = EVAL_SAFE(domain, globals_dict)
      // console.log('domain2: ', domain2)
      return domain2
    } else {
      return domain
    }
  }

  _view_node_attrs_options(node) {
    const res = this._view_node_attrs_base(node.attrs, ['options'])
    return res.options
  }

  _view_node_attrs_context(node) {
    const res = this._view_node_attrs_base(node.attrs, ['context'])
    return res.context
  }

  _view_node_attrs_base(attrs, items) {
    // console.log('eval_safe_python1', attrs)
    // options: "{'no_open':True,'no_create': True}"
    // context: "{'default_is_company': True, 'show_vat': True}"
    // domain: "[('is_company', '=', True)]"

    // const ss = {
    //   default_parent_id: active_id,
    //   default_street: street,
    //   default_street2: street2,
    //   default_city: city,
    //   default_state_id: state_id,
    //   default_zip: zip,
    //   default_country_id: country_id,
    //   default_lang: lang,
    //   default_user_id: user_id,
    //   default_type: 'other'
    // }

    const result = items.reduce((acc, cur) => {
      const value = attrs[cur]
      if (value) {
        acc = {
          ...acc,
          [`${cur}_old`]: value,
          [cur]: this.eval_safe(value)
        }
      }
      return acc
    }, {})

    return result
  }

  form_validator(fld, rule, value, cb) {
    // console.log(' form_validator ', fld, rule, value, cb)
    const meta = this._columns[fld]
    const ret = meta.validator(this, rule, value)
    cb(ret)
  }
}

const EVAL_SAFE = (domain, globals_dict = {}, locals_dict = {}) => {
  const to_replaced = { '\\(': '[', '\\)': ']', False: 'false', True: 'true' }
  to_replaced['function'] = 'function2'

  let domain2 = domain
  Object.keys(to_replaced).forEach(item => {
    domain2 = domain2.replace(new RegExp(item, 'g'), to_replaced[item])
  })

  const kwargs = { ...globals_dict, ...locals_dict }

  const parent_vals = kwargs.parent
  delete kwargs.parent

  const fn_str = []
  fn_str.push('() => {')
  Object.keys(kwargs).forEach(item => {
    const vals = kwargs[item]
    const is_str = typeof vals === 'string'
    const is_arr = Array.isArray(vals)
    const vals2 = is_str ? `'${vals}'` : is_arr ? `[${vals}]` : vals
    // console.log('fn eval 1:', item, vals, vals2)
    const item2 = item === 'function' ? 'function2' : item
    const str_to_push = `const ${item2} = ${vals2}`
    // console.log('fn eval 1:', item, vals, vals2, str_to_push)
    fn_str.push(str_to_push)
  })

  if (parent_vals) {
    fn_str.push('const parent = {')
    const p_str = []
    Object.keys(parent_vals).forEach(item => {
      const vals = parent_vals[item]
      const is_str = typeof vals === 'string'
      const is_arr = Array.isArray(vals)
      const vals2 = is_str ? `'${vals}'` : is_arr ? `[${vals}]` : vals
      // console.log('fn eval 1:', item, vals, vals2)
      const item2 = item === 'function' ? 'function2' : item
      const str_to_push = `${item2}: ${vals2}`
      // console.log('fn eval 1:', item, vals, vals2, str_to_push)
      p_str.push(str_to_push)
    })
    fn_str.push(p_str.join(',\n'))
    fn_str.push('} ')
  }

  fn_str.push(`return ${domain2}`)
  fn_str.push('}')

  const fn_str2 = fn_str.join('\n')
  // console.log('fn eval:', fn_str2)
  // console.log('fn eval 222:', parent)

  const fn = eval(fn_str2)
  // console.log('fn eval fn::', fn)
  const ret = fn()
  // console.log(ret)

  return ret
}
