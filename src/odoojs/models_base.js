// Array and Object 注意 使用时, 复制一份
// 1 使用者: 如果本地可能有修改 那么 应该复制一份, 而不是直接使用 旧的
// 2 授权者: 把一个 Array 给了别人, 如果不想被修改, 那么给一个副本, 不要给原件

import xml2json from './xml2json.js'

const deep_copy = node => {
  return JSON.parse(JSON.stringify(node))
}

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
BaseModel._model_id = undefined // 用于 处理 fields 中的 domain str2list

export class Model extends BaseModel {
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
    return this.ids.map(id_ => this._getById(id_).fetch_one())
  }

  fetch_one() {
    // console.log('fetch_one', this._name, this.ids)
    const acc_init = { id: this.id }
    return Object.keys(this._columns).reduce((acc, col) => {
      const meta = this._columns[col]
      acc = { ...acc, ...meta.fetch_one(this) }
      return acc
    }, acc_init)
  }

  //
  //  主页页面 调用, tree view / form view (read / edit / new)
  //

  static async browse(ids, payload) {
    // console.log('xxx, browse:', this._name, ids, payload)
    if (ids === undefined) {
      throw 'call browse without ids'
    }

    // form_view or tree_view
    // new
    return await this._browse_native(this.env, ids, payload)
  }

  static async _browse_native(env, ids, payload = {}) {
    const { fetch_one, fetch_all } = payload
    await this.awaiter
    const records = new this()
    await records.awaiter
    records._env_local = env

    records._ids = _normalize_ids(ids)

    records._values = {} // {field: {ID: value}}
    records._values_to_write = {} // {field: {ID: value}}
    records._values_relation = {}

    Object.keys(this._columns).forEach(field =>
      this._columns[field]._init_storage(records)
    )
    // main read, set callback
    records._callback_onchange = fetch_one
    records._callback_onchange_all = fetch_all

    if (ids) {
      await records._init_values()
    } else {
      await records._init_values_for_new_call_onchange()
    }

    // 按照约定, browse后, 要触发 callback, 返回数据
    records.event_onchange()
    records.event_onchange_all()

    return records
  }

  static _browse_iterated(env, ids, payload = {}) {
    const { iterated, fetch_one } = payload

    const records = new this()
    records._env_local = env
    records._ids = _normalize_ids(ids)

    records._values = iterated._values
    records._values_to_write = iterated._values_to_write
    records._values_relation = iterated._values_relation

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
          // 如果是切片 1个以上? 目前 only call by getById, getByIndex, 只有一个 切片
        }
      }
    }

    return records
  }

  //  TBD relation async call
  //
  //  o2m new, to be check
  async new() {
    if (!this._from_record) {
      return null
    }

    const [parent, field] = this._from_record
    return field.new(parent)
  }

  //  o2m del, to be check
  async remove(record) {
    if (!this._from_record) {
      return null
    }
    const [parent, field] = this._from_record
    field.remove(parent, record)
  }

  static async _browse_relation_o2m_new_async(env, ids, payload = {}) {
    const records = this._browse_relation_base(env, ids, payload)
    const { iterated } = payload

    //  o2m new, 需要处理 _callback_onchange_all
    if (iterated._callback_onchange_all) {
      const callback = () => iterated.event_onchange_all()
      records._callback_onchange = callback
    }
    await records._init_values_for_new_call_onchange()
    return records
  }

  //
  // relation sync call, all  need not init values
  //

  static _browse_relation_base(env, ids, payload = {}) {
    const { from_record } = payload
    const [parent, field] = from_record
    const records = new this()
    records._env_local = env

    records._ids = _normalize_ids(ids)

    const storage = parent._values_relation[field.name]
    records._values = storage._values
    records._values_to_write = storage._values_to_write
    records._values_relation = storage._values_relation

    Object.keys(this._columns).forEach(field =>
      this._columns[field]._init_storage(records)
    )

    records._from_record = from_record
    return records
  }

  // 这个返回一个 空 壳子 record
  static _browse_relation_m2o(env, ids, payload = {}) {
    return this._browse_relation_base(env, ids, payload)
  }

  static _browse_relation_o2m_new(env, ids, payload = {}) {
    const records = this._browse_relation_base(env, ids, payload)

    const { iterated, values } = payload

    //  o2m new, 需要处理 _callback_onchange_all
    if (iterated._callback_onchange_all) {
      const callback = () => iterated.event_onchange_all()
      records._callback_onchange = callback
    }

    if (values) {
      // 使用 已有的 values 进行初始化数据
      records._init_values_for_new_by_values(values)
    } else {
      //
    }

    return records
  }

  // 返回一个null 壳子 record. 数据已经 在 parent 里, 无需 再处理数据
  static _browse_relation_o2m(env, ids, payload = {}) {
    const records = this._browse_relation_base(env, ids, payload)

    const { from_record } = payload
    const [parent, field] = from_record

    if (parent._callback_onchange) {
      const callback = () => parent.event_onchange(field.name)
      records._callback_onchange_all = callback
    }

    return records
  }

  //
  // TBD remove it
  //

  _init_callback(payload) {
    const { iterated, from_record, fetch_one } = payload
    // if o2m new : iterated, from_record all is true
    const records = this

    if (fetch_one) {
      // main call,
      records._callback_onchange = fetch_one
    } else if (iterated) {
      // o2m 切片 or o2m new, 需要处理 _callback_onchange_all
      records._callback_onchange_all = iterated._callback_onchange_all

      // 切片 后, 原本 有 callback_all, so define callbak for each record
      if (iterated._callback_onchange_all) {
        if (records._ids.length === 1) {
          const callback = () => iterated.event_onchange_all()
          records._callback_onchange = callback
        } else {
          // 如果是切片 1个以上? 目前 only call by getById, getByIndex, 只有一个 切片
        }
      }
    } else if (from_record) {
      // from_record && !iterated.  o2m edit, from parent
      const [parent, field] = from_record
      if (parent._callback_onchange) {
        const callback = () => parent.event_onchange(field.name)
        records._callback_onchange_all = callback
      }
    }
  }

  static async _browse(env, ids, payload = {}) {
    // view_ref = module_name.view_from_xml_name
    // view_ref = my_xml_id_name_not_point
    const { from_record, iterated, view_ref } = payload
    const { fetch_one } = payload

    // if o2m new, from_record is true, iterated is true
    // fetch_one:  main call, dict callback
    // fetch_all:  main call, list callback

    const check_is_o2m_edit = () => {
      if (from_record) {
        const [parent, field] = from_record
        if (parent.field_onchange && field.type == 'one2many') {
          return true
        }
      }
      return false
    }

    const is_o2m_edit = check_is_o2m_edit()

    await this.awaiter
    const records = new this()
    await records.awaiter
    records._env_local = env

    // 1 o2m new, need a virtual id
    // 2 main new, need not virtual id
    const ids2 = is_o2m_edit && !ids ? this._odoo._get_virtual_id() : ids

    records._ids = _normalize_ids(ids2)

    if (from_record) {
      // o2m, m2m, m2o
      const [parent, field] = from_record
      // console.log('init storage,', this._name, this.ids)
      // console.log('init storage 2,', parent._values_relation, field.name)
      // parent 已经定义了 _values_relation , 不可能为 null
      const storage = parent._values_relation[field.name]
      records._values = storage._values
      records._values_to_write = storage._values_to_write
      records._values_relation = storage._values_relation
    } else {
      // main call.  1 new. 2 read
      records._values = {} // {field: {ID: value}}
      records._values_to_write = {} // {field: {ID: value}}
      records._values_relation = {}
    }

    Object.keys(this._columns).forEach(field =>
      this._columns[field]._init_storage(records)
    )

    records._from_record = from_record

    if (from_record) {
      // o2m edit: from_record=true, iterated=false
      // o2m new:  from_record=true, iterated=true
      records._init_callback({ from_record, iterated })
    } else {
      // main read, set callback
      records._callback_onchange = fetch_one
    }

    console.log('xxxxx,', this._name, is_o2m_edit)

    if (view_ref && records.ids.length) {
      // edit from page
      await records._init_values_for_edit()
    } else if (view_ref) {
      // new from page
      await records._init_values_for_new()
    } else if (!is_o2m_edit) {
      // read
      await records._init_values()
    } else if (is_o2m_edit && !ids) {
      // o2m new
      await records._init_values_for_new()
    } else if (is_o2m_edit) {
      // o2m edit
      const virtual_ids = records.ids.filter(item => is_virtual_id(item))
      const real_ids = records.ids.filter(item => !is_virtual_id(item))

      if (real_ids.length) {
        await records._init_values_for_edit({ partial_ids: real_ids })
      }

      records._init_values_for_virtual(virtual_ids)
      records._init_values_to_write_for_edit()
    } else {
      // never goto here
      throw 'some errer'
    }

    return records
  }

  //
  // init values
  //

  // ok
  async _init_values(paylaod = {}) {
    // console.log('xx in _init_values :', this._name, this.ids)
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

      const ids_fetched = new Set()
      result.forEach(row => {
        ids_fetched.add(row.id)
      })

      result.forEach(row => {
        ids_fetched.add(row.id)

        Object.keys(row).forEach(field_name => {
          if (field_name !== 'id') {
            const meta = columns[field_name]
            meta._init_values(this, row.id, row[field_name])
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

  //
  // init values for new
  //

  static _get_default(col) {
    const meta = this._columns[col]
    if (['many2many', 'one2many'].includes(meta.type)) {
      return []
    } else if (['float', 'integer', 'monetary'].includes(meta.type)) {
      return 0
    } else if (['text', 'html'].includes(meta.type)) {
      return ''
    }
    return false
  }

  _init_values_for_new_default() {
    const id_ = this.id || null
    Object.keys(this._values).forEach(field_name => {
      const val = this.constructor._get_default(field_name)
      this._columns[field_name]._init_values(this, id_, val)
    })
  }

  _init_values_for_new_by_values(values) {
    this._init_values_for_new_default()

    Object.keys(values).forEach(field => {
      const meta = this._columns[field]
      const val = values[field]
      meta.setValueByOnchange(this, val)
    })

    this._update_parent()
  }

  async _init_values_for_new_call_onchange(/* paylaod = {} */) {
    // const { context = this.env.context } = paylaod
    this._init_values_for_new_default()
    const onchange = await this._onchange2({}, [], this.field_onchange)
    await this._after_onchange(onchange)
  }

  //
  // TBD category
  //

  // ok
  async _init_values_for_edit(paylaod = {}) {
    await this._init_values(paylaod)
  }

  // ok
  _init_values_to_write_for_edit() {
    const [parent, field] = this._from_record
    const tuples = parent._values_to_write[field.name][parent.id] || []
    const values_dict = tuples.reduce((acc, cur) => {
      if (cur[0] === 0 || cur[0] === 1) {
        acc[cur[1]] = cur[2]
      }
      return acc
    }, {})

    this.ids.forEach(vid => {
      const vals = values_dict[vid] || {}
      Object.keys(this._values).forEach(field_name => {
        if (vals[field_name] !== undefined) {
          const meta = this._columns[field_name]
          meta._init_values_to_write(this, vid, vals[field_name])
        }
      })
    })
  }

  // ok
  _init_values_for_virtual(virtual_ids) {
    virtual_ids.forEach(vid => {
      Object.keys(this._values).forEach(field_name => {
        const val = this.constructor._get_default(field_name)
        const meta = this._columns[field_name]
        meta._init_values(this, vid, val)
      })
    })
  }

  // ok
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

  //
  // onchange
  //

  // ok
  async trigger_onchange(field_name) {
    // console.log('trigger_onchange,11 ', this._name, this.id, field_name)

    if (!this.field_onchange) {
      return
    }

    if (this._from_record) {
      // 1st, o2m update parent. so, value for onchange with parent
      console.log('trigger_onchange,22 ', this._name, this.id, field_name)
      this._update_parent()
    }

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
    const onchange = await this._onchange2(...args)

    // 4th, update values_to_write
    await this._after_onchange(onchange)

    // 5th parent trigger onchange
    if (this._from_record) {
      const [parent, field] = this._from_record
      const name2 = `${field.name}.${field_name}`
      if (parent.field_onchange[name2]) {
        await parent.trigger_onchange(field.name)
      }
    }

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
      meta.setValueByOnchange(this, val)
    })

    // 5th, update _update_parent1
    if (this._from_record) {
      this._update_parent()
    }
  }

  // ok
  _update_parent() {
    // call before onchange and after onchange
    if (!this._from_record) {
      return
    }
    const [parent, field] = this._from_record

    const values = Object.keys(this._values_to_write).reduce((acc, fld) => {
      if (this._values_to_write[fld][this.id] !== undefined) {
        acc[fld] = this._values_to_write[fld][this.id]
      }
      return acc
    }, {})

    field.setValueFromRelation(parent, this.id, values)
  }

  //
  // commit
  //

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
    await this._init_values_for_edit()
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
    // 切片为一条之后, 需要有自己的 callback, 才能给页面传数据
    // 外部使用, 切片后, 触发 onchange
    if (this.ids.includes(id_)) {
      const { fetch_one } = kwargs
      const payload = { iterated: this, fetch_one }
      const res = this.constructor._browse_iterated(this.env, id_, payload)
      // 按照约定, 切片后, 要触发 callback, 返回数据
      res.event_onchange()

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
  //   const res = this.constructor._browse_iterated(this.env, new_ids, this)
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

    // console.log('execute_kw', this._name, method, args, kwargs)

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
    const method = 'write'
    return this.execute(method, vals)
  }

  static async write(rid, vals) {
    const method = 'write'
    return this.execute(method, rid, vals)
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

  //
  // call by env _init_columns fields_view_get
  //

  static _onchange_spec(view_info) {
    const result = {}

    const process = (node, info, prefix) => {
      if (node.tagName === 'field') {
        const name = node.attr.name
        const names_list = prefix ? [prefix, name] : [name]
        const names = names_list.join('.')
        if (!Object.keys(result).includes(names)) {
          result[names] = node.attr.on_change || ''
        }
        Object.values(info.fields[name].views || {}).forEach(subinfo => {
          process(xml2json.toJSON(subinfo.arch), subinfo, names)
        })
      } else {
        const children = node.children || []
        children.forEach(child => {
          process(child, info, prefix)
        })
      }
    }

    if (view_info.arch) {
      const root = xml2json.toJSON(view_info.arch)
      process(root, view_info, '')
    }

    return result
  }

  //
  // onchange
  //

  // ok
  async _onchange2(values, field_name, field_onchange) {
    const session_info = this._odoo.session_info
    const server_version_info = session_info.server_version_info
    const version = server_version_info[0]
    const is_call_default =
      (!field_name || (Array.isArray(field_name) && !field_name.length)) &&
      version == 13

    if (is_call_default) {
      const onchange = this._default_get_onchange(values, field_onchange)
      return onchange
    }

    if (!this.id || is_virtual_id(this.id)) {
      const asrgs = [[], values, field_name, field_onchange]
      const onchange = await this.constructor.execute('onchange', ...asrgs)
      return onchange
    } else {
      const asrgs = [values, field_name, field_onchange]
      const onchange = await this.execute('onchange', ...asrgs)
      return onchange
    }
  }

  // ok , call by _onchange2
  // TBD: default_get 里面 可能有 m2o o2m 需要处理
  async _default_get_onchange(values = {}, field_onchange = {}) {
    const fields = Object.keys(field_onchange).filter(
      fld => fld.split('.').length === 1
    )

    // console.log(this._name, field_onchange, fields)

    const default_get1 = await this.constructor.execute('default_get', fields)

    // console.log('default get ', default_get1)

    const _get_default = col => {
      const meta = this._columns[col] || {}

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

    // # TBD: default_get 里面 可能有 m2o o2m 需要处理
    // default_get, m2o 返回值 是 id, 需要 补充上 display_name
    const default_get2 = {}

    for (const col of Object.keys(default_get1)) {
      if (this._columns[col].relation) {
        const ref_val = default_get1[col]

        if (ref_val) {
          const ref_ids = Array.isArray(ref_val) ? ref_val : [ref_val]
          const domain = [['id', 'in', ref_ids]]
          const ref_records = await this.env
            .model(this._columns[col].relation)
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
    return onchange2
  }

  // for odoo call  这个 应该没有用了
  async get_selection(kwargs = {}) {
    const { fields = [] } = kwargs
    const selections = {}

    for (const field_name of fields) {
      // M2m 字段 有两种情况,
      // 1 是 partner.category 这种的, 前端用 select 选择框
      // 2 是 sale.order 里的 invoice_ids 这种的, 前端 大概不是  select 选择框
      // TBD 2021-3-10

      const fs = field_name.split('.')
      if (fs.length > 1) {
        // TBD , 这个 需要 子模型的 values , 显然 不能在父 模型中 这样直接获取
        // const [parent_field, child_field] = fs
        // const Relation = this.env.model(this._columns[parent_field].relation)
        // const selection = Relation.get_selection(child_field, kwargs)
        // return selection
      } else {
        const meta = this._columns[field_name]
        selections[field_name] = await meta.get_selection(this)
      }
    }

    // console.log(selections)
    return selections
  }

  //  这个 应该没有用了
  static async fields_view_get(view_id_or_xml_id) {
    let view_id = view_id_or_xml_id
    if (view_id_or_xml_id && typeof view_id_or_xml_id === 'string') {
      view_id = (await this.env.ref(view_id_or_xml_id)).id
    }
    const args = view_id ? [view_id] : []
    const view_info = await this.execute('fields_view_get', ...args)

    // const arch2 = xml2json.toJSON(view_info.arch)
    return { ...view_info }
  }
}
