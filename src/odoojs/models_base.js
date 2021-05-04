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

  static async get_model_id() {
    const model_id = this._view_info.model_id
    if (model_id) {
      return model_id
    }

    const dm = [['model', '=', this._name]]
    const model_ids = await this._odoo.execute('ir.model', 'search', dm)
    const model_id2 = model_ids.length ? model_ids[0] : 0
    this._view_info.model_id = model_id2
    return model_id2
  }

  async get_model_id() {
    return this.constructor.get_model_id()
  }
}

// to be set by child
BaseModel._env = undefined
BaseModel._odoo = undefined
BaseModel._name = undefined
BaseModel._columns = {}
// BaseModel._model_id = undefined // 用于 处理 fields 中的 domain str2list

class BaseModel2 extends BaseModel {
  constructor() {
    super()
    this._env_local = null
    this._ids = []
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

  get field_onchange() {
    return this.constructor._field_onchange
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
    // console.log('fetch_all', this._name, this.ids, this._columns, this)
    return this.ids.map(id_ => this._getById(id_).fetch_one())
  }

  fetch_one() {
    const acc_init = { id: this.id }
    return Object.keys(this._columns).reduce((acc, col) => {
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
    await this.awaiter

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
    //   // 1st, o2m update parent. so, value for onchange with parent
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

    // 4th, update values_to_write
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
    for (const col of Object.keys(this._columns)) {
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

export class Model extends BaseModel2 {
  constructor() {
    super()
  }

  /* o2m CRUD */
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

  _update_from_record(record) {
    console.log('update_from_record, 1')
    this._ids = Array.from(new Set([...this.ids, ...record.ids]))
    Object.keys(this._columns).forEach(field =>
      this._columns[field]._set_by_object(this, record)
    )

    return
  }

  copy(payload) {
    const records = this._copy_init(payload)
    records._update_from_record(this)
    return records
  }

  async new_copy(payload) {
    const records = this._copy_init({ ...payload, isNew: 1 })
    const ids = this._odoo._get_virtual_id()
    records._ids = _normalize_ids(ids)
    await records._init_values_by_new()
    return records
  }

  _copy_init(payload = {}) {
    const { fetch_one, fetch_all, isNew } = payload

    const this_class = this.constructor

    let MyCls = this.constructor

    const env = this_class.env

    if (isNew && this_class._views.form) {
      const [parent, parent_field] = this._from_record
        ? [this._from_record[0].constructor, this._from_record[1].name]
        : [null, null]

      MyCls = env.model(this_class._name, 'form', {
        parant_reg_name: this_class._reg_name,
        parent,
        parent_field,
        isSync: true,
        view_info: this_class._views.form,
        views: this_class._views
      })
    }

    const records = new MyCls()
    records._env_local = MyCls.env
    records._ids = []
    records._from_record = this._from_record

    records._values = {}
    records._values_to_write = {}
    records._values_relation = {}
    records._values_relation2 = {}

    Object.keys(this._columns).forEach(field =>
      this._columns[field]._init_storage(records)
    )

    records._callback_onchange = fetch_one
    records._callback_onchange_all = fetch_all
    return records
  }

  static _browse_iterated(env, ids, payload = {}) {
    const { iterated, fetch_one } = payload
    // 切片后, 单条记录通常是用来 显示 form 的

    let MyCls = this

    if (!Array.isArray(ids) && this._views.form) {
      const [parent, parent_field] = this._from_record
        ? [this._from_record[0].constructor, this._from_record[1].name]
        : [null, null]

      MyCls = env.model(this._name, 'form', {
        parant_reg_name: iterated._from_record[0]._reg_name,
        parent,
        parent_field,
        isSync: true,
        view_info: this._views.form,
        views: this._views
      })
    }

    const records = new MyCls()

    records._env_local = env
    records._ids = _normalize_ids(ids)

    records._values = iterated._values
    records._values_to_write = iterated._values_to_write
    records._values_relation = iterated._values_relation
    records._values_relation2 = iterated._values_relation2

    records._from_record = iterated._from_record

    if (fetch_one) {
      // main call,
      records._callback_onchange = fetch_one
    } else if (iterated) {
      // o2m 切片   需要处理 _callback_onchange_all
      // 切片 后, 原本 有 callback_all, so define callbak for each record
      if (iterated._callback_onchange_all) {
        records._callback_onchange_all = iterated._callback_onchange_all
        if (records._ids.length === 1) {
          const callback = () => iterated.event_onchange_all()
          records._callback_onchange = callback
        } else {
          // 如果是切片 1个以上? 目前 only call by getById1, getByIndex, 只有一个 切片
        }
      }
    }

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

    return await this._browse(this.env, ids, payload)
  }

  static async _browse(env, ids, payload = {}) {
    const { fetch_one, fetch_all } = payload
    await this.awaiter
    const records = new this()
    await records.awaiter
    records._env_local = env

    records._ids = _normalize_ids(ids)

    records._values = {}
    records._values_to_write = {}
    records._values_relation = {}
    records._values_relation2 = {}

    Object.keys(this._columns).forEach(field =>
      this._columns[field]._init_storage(records)
    )

    // main read, set callback
    records._callback_onchange = fetch_one
    records._callback_onchange_all = fetch_all

    if (ids) {
      await records._init_values()
    } else {
      //
      await records._init_values_by_new()
    }

    // 按照约定, browse后, 要触发 callback, 返回数据
    records.event_onchange()
    records.event_onchange_all()

    return records
  }

  static _browse_relation(env, ids, payload = {}) {
    // 这个返回一个 空 壳子 record
    const { from_record } = payload
    const [parent, field] = from_record
    const records = new this()
    records._env_local = env

    records._ids = _normalize_ids(ids)

    const storage = parent._values_relation[field.name]
    records._values = storage._values
    records._values_to_write = storage._values_to_write
    records._values_relation = storage._values_relation
    const storage2 = parent._values_relation2[field.name]
    records._values_relation2 = storage2._values_relation2

    Object.keys(this._columns).forEach(field =>
      this._columns[field]._init_storage(records)
    )

    records._from_record = from_record
    return records
  }

  // m2m, o2m, async read
  static async _browse_relation_async(env, ids, payload = {}) {
    const records = this._browse_relation(env, ids, payload)

    const { from_record } = payload
    const [parent, field] = from_record
    // console.log('_browse_relation_async, ', this._name, parent)

    if (parent._callback_onchange) {
      const callback = () => parent.event_onchange(field.name)
      records._callback_onchange_all = callback
    }

    await records._init_values()
    records.event_onchange_all()

    return records
  }

  // o2m new
  static _browse_relation_o2m_new(env, ids, payload = {}) {
    const records = this._browse_relation(env, ids, payload)
    const { iterated } = payload

    if (iterated._callback_onchange_all) {
      const callback = () => iterated.event_onchange_all()
      records._callback_onchange = callback
    }

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

  /*  init values  */

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

  async _init_values(paylaod = {}) {
    // console.log('xx in _init_values1 :', this._name, this.ids)
    const { partial_ids = [], context = this.env.context } = paylaod

    const columns = this.constructor._columns
    const basic_fields = Object.keys(columns).reduce((acc, field_name) => {
      // 应该特殊处理 二进制字段
      const Field = columns[field_name]
      if (Field.type !== 'binary') {
        acc = [...acc, field_name]
      }
      return acc
    }, [])

    const ids = partial_ids.length ? partial_ids : this.ids

    if (ids.length) {
      const result = await this.read(basic_fields, {
        context
        // load: '_classic_read'
        // load: '_classic_write'
      })
      // 缺省 使用 _classic_read,  m2o 字段 返回 [m2o.id, m2o.display_name]
      // 缺省 使用 _classic_read,  x2m 字段 返回 [ids]

      // console.log(deep_copy(result))

      const ids_fetched = new Set()
      result.forEach(row => {
        ids_fetched.add(row.id)
      })

      result.forEach(row => {
        ids_fetched.add(row.id)

        Object.keys(row).forEach(field_name => {
          if (field_name !== 'id') {
            const meta = columns[field_name]
            meta._set_by_init(this, row)
          }
        })
      })

      const ids_all = new Set(this.ids)

      const ids_in_error = [
        ...new Set([...ids_all].filter(n => !ids_fetched.has(n)))
      ]

      if (ids_in_error.length) {
        const str = `There is no '${this._name}' record with IDs ${ids_in_error}.`
        throw str
      }
    } else {
      //
    }
  }

  async _init_values_by_new(/* paylaod = {} */) {
    // console.log('xxx, _init_values_for_new_call_onchange1 1:', this._name)
    // const { context = this.env.context } = paylaod
    Object.keys(this._values).forEach(field_name => {
      this._columns[field_name]._set_default(this)
    })

    const onchange = await this._onchange2({}, [], this.field_onchange)
    await this._after_onchange(onchange)
  }
}
