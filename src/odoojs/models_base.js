// Array and Object 注意 使用时, 复制一份
// 1 使用者: 如果本地可能有修改 那么 应该复制一份, 而不是直接使用 旧的
// 2 授权者: 把一个 Array 给了别人, 如果不想被修改, 那么给一个副本, 不要给原件

import xml2json from './xml2json.js'

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

const eval_safe = (domain, globals_dict = {}, locals_dict = {}) => {
  const to_replaced = {
    '\\(': '[',
    '\\)': ']',
    False: 'false',
    True: 'true'
  }

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
BaseModel._field_onchanges = {} // 用于编辑页面

export class Model extends BaseModel {
  constructor() {
    super()
    this._env_local = null
    this._ids = []
    this._init_storage()
  }

  _init_storage(payload = {}) {
    const { iterated, from_record, field_onchange = {} } = payload
    if (iterated) {
      this._from_record = iterated._from_record
      this._field_onchange = iterated._field_onchange
      this._values = iterated._values
      this._values_to_write = iterated._values_to_write
      this._values_relation = iterated._values_relation
    } else {
      this._from_record = from_record
      this._field_onchange = field_onchange
      if (from_record) {
        const [parent, field] = from_record
        const storage = parent._values_relation[field.name] || {}

        this._values = storage._values || {}
        this._values_to_write = storage._values_to_write || {}
        this._values_relation = storage._values_relation || {}
      } else {
        this._values = {} // {field: {ID: value}}
        this._values_to_write = {} // {field: {ID: value}}
        this._values_relation = {}
      }

      Object.keys(this.constructor._columns).forEach(field => {
        if (!this._values[field]) {
          this._values[field] = {}
        }
        if (!this._values_to_write[field]) {
          this._values_to_write[field] = {}
        }
        const meta = this.constructor._columns[field]
        if (meta.relation) {
          if (!this._values_relation[field]) {
            this._values_relation[field] = {}
            this._values_relation[field]._values = {}
            this._values_relation[field]._values_to_write = {}
            this._values_relation[field]._values.display_name = {}
          }
        }
      })
    }
  }

  iterator_next(index) {
    if (index < this.ids.length) {
      return this.constructor._browse_iterated(this.env, this.ids[index], this)
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
    return this._field_onchange
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

  async with_env(env) {
    // env, context 改变以后, 比如 lang, value 会改变
    // 因此 with_context 之后, 应该就是一个 全新的 model
    const res = this.constructor._browse(env, this.ids)
    return res
  }

  //

  async new() {
    if (!this._from_record) {
      return null
    }

    const records = await this.constructor._browse(this.env, null, {
      from_record: this._from_record
    })

    return records
  }

  static async browse(ids, payload) {
    if (ids === undefined) {
      throw 'call browse without ids'
    }
    return this._browse(this.env, ids, payload)
  }

  static _browse_iterated(env, ids, iterated) {
    // 迭代 返回的 不是 promise
    const records = new this()
    records._env_local = env
    records._ids = _normalize_ids(ids)
    records._init_storage({ iterated })
    return records
  }

  static async _browse(env, ids, payload = {}) {
    // view_form_xml_id = module_name.view_from_xml_name
    // view_form_xml_id = my_xml_id_name_not_point
    const { from_record, view_form_xml_id } = payload

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
    // console.log(records.awaiter)
    await records.awaiter
    records._env_local = env
    const ids2 = is_o2m_edit && !ids ? this._odoo._get_virtual_id() : ids
    records._ids = _normalize_ids(ids2)

    const field_onchange = await this._get_field_onchange(
      view_form_xml_id,
      from_record
    )

    records._init_storage({ from_record, field_onchange })

    if (view_form_xml_id && records.ids.length) {
      // edit from page
      await records._init_values_for_edit()
    } else if (view_form_xml_id) {
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
      await records._init_values_for_edit({ partial_ids: real_ids })
      await records._init_values_for_virtual(virtual_ids)
      await records._init_values_to_write_for_edit()
    } else {
      // never goto here
      throw 'some errer'
    }

    return records
  }

  // ok
  async _init_values(paylaod = {}) {
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
      // 存储 m2o.id:   this._values[field][row.id] = m2o.id
      // 存储 m2o.name: this._values_relation[field]._values.display_name[m2o.id] = m2o.display_name

      const ids_fetched = new Set()

      result.forEach(row => {
        Object.keys(row).forEach(field_name => {
          ids_fetched.add(row.id)
          if (field_name !== 'id') {
            const meta = columns[field_name]
            if (meta.type === 'many2one') {
              const val = row[field_name]
              this._values[field_name][row.id] = val ? val[0] : val
              if (val) {
                this._values_relation[field_name]._values.display_name[val[0]] =
                  val[1]
              }
            } else {
              this._values[field_name][row.id] = row[field_name]
            }
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

  // ok
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

  // ok
  async _init_values_for_new(/* paylaod = {} */) {
    // const { context = this.env.context } = paylaod
    const id_ = this.id || null
    Object.keys(this._values).forEach(field => {
      this._values[field][id_] = this.constructor._get_default(field)
    })

    const onchange = await this._onchange2({}, [], this.field_onchange)
    this._after_onchange(onchange)
  }

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
      Object.keys(this._values).forEach(fld => {
        if (vals[fld] !== undefined) {
          this._values_to_write[fld][vid] = vals[fld]
        }
      })
    })
  }

  // ok
  _init_values_for_virtual(virtual_ids) {
    virtual_ids.forEach(vid => {
      Object.keys(this._values).forEach(fld => {
        this._values[fld][vid] = this._get_default(fld)
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

  // ok
  async trigger_onchange(field_name) {
    // console.log('trigger_onchange,11 ', this._name, this.id, field_name)

    if (!this.field_onchange) {
      return
    }

    if (this._from_record) {
      // 1st, o2m update parent. so, value for onchange with parent
      this._update_parent()
    }

    if (field_name && !this.field_onchange[field_name]) {
      return
    }

    const values = this._get_values_for_onchange()

    if (this._from_record) {
      // 2nd, parent value in values_for_onchange, with o2m value. this is why 1st _update_parent
      const [parent, field] = this._from_record
      const parent_vals = parent._get_values_for_onchange({ for_parent: true })
      values[field.relation_field] = parent_vals
    }

    // 3rd, onchange
    const args = [values, field_name, this.field_onchange]
    const onchange = await this._onchange2(...args)

    // 4th, update values_to_write, and _update_parent
    this._after_onchange(onchange)

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
  _after_onchange(onchange) {
    //
    // const onchange_domain = onchange.domain || {}
    // TBD domain
    // log(' after onchange,', onchange)
    const onchange_value = onchange.value
    Object.keys(onchange_value).forEach(field => {
      const meta = this._columns[field]
      const val = onchange_value[field]
      this._values_to_write[field][this.id] =
        meta.type === 'many2one' ? (val ? val[0] : false) : val
    })

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

    field._update_relation(parent, this.id, values)
  }

  // commit

  _get_values_for_create() {
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
    await this._init_values_for_edit()
    return id_
  }

  // call by commit
  async _commit_write() {
    await this.awaiter
    const vals = this._get_values_for_write()
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

    await this._init_values_for_edit()
    return res
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
  slice(start, end) {
    const new_ids = this.ids.slice(start, end)
    const res = this.constructor._browse_iterated(this.env, new_ids, this)
    return res
  }

  sliceById(id_) {
    const res = this.constructor._browse_iterated(this.env, id_, this)
    return res
  }

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

  // for  odoo call

  static async execute_kw(method, args = [], kwargs = {}) {
    await this.awaiter

    const kwargs2 = { ...kwargs }
    if (!Object.keys(kwargs).includes('context')) {
      kwargs2.context = this.env.context
    }

    const res = this._odoo.execute_kw(this._name, method, args, kwargs2)
    return res
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

  static async create(vals) {
    return this.execute('create', vals)
  }

  static async search(domain, kwargs = {}) {
    return this.execute_kw('search', [domain], kwargs)
  }

  static async default_get(fields) {
    return this.execute('default_get', fields)
  }

  // for odoo call

  // ok call by get_selection
  static async _get_domain(field, kwargs = {}) {
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
      const session_info = this._odoo.session_info
      // # company_id = session_info['company_id']
      const user_companies = session_info.user_companies
      const current_company = user_companies.current_company[0]
      // # allowed_companies = user_companies['allowed_companies']
      // # allowed_company_ids = [com[0] for com in allowed_companies]
      return current_company
    }

    const _get_res_model_id = async () => {
      if (this._model_id) {
        return this._model_id
      }

      const dm = [['model', '=', this._name]]
      const model_ids = this._odoo.execute('ir.model', 'search', dm)
      const model_id = model_ids.length ? model_id[0] : 0
      this._model_id = model_id
      return model_id
    }

    const { locals_dict } = kwargs

    const Field = this._columns[field]
    const domain = Field.domain || false

    const globals_dict = {
      company_id: _get_company_id(),
      res_model_id: await _get_res_model_id()
    }

    if (domain && typeof domain === 'string') {
      // console.log('domain: ', field)
      const domain2 = eval_safe(domain, globals_dict, locals_dict)
      // console.log('domain2: ', domain2)
      return domain2
    } else {
      return domain
    }
  }

  // ok
  async get_selections(kwargs = {}) {
    const selections = {}
    for (const field_name in this._columns) {
      const meta = this._columns[field_name]
      if (meta.type === 'many2one') {
        const ops = await this.get_selection(field_name, kwargs)
        selections[field_name] = ops
      } else if (meta.type === 'selection') {
        const ops = this._columns[field_name].selection
        selections[field_name] = ops
      }
    }
    return selections
  }

  // ok
  async get_selection(field_name, kwargs = {}) {
    return this.constructor.get_selection(field_name, kwargs)
  }

  static async get_selection(field_name, kwargs = {}) {
    await this.awaiter
    const { locals_dict } = kwargs
    const fs = field_name.split('.')
    if (fs.length > 1) {
      const [parent_field, child_field] = fs
      const Relation = this.env.model(this._columns[parent_field].relation)
      const selection = Relation.get_selection(child_field, kwargs)
      return selection
    } else {
      const domain = await this._get_domain(field_name, { locals_dict })
      const relation = this._columns[field_name].relation
      // const context = this._columns[field_name].context
      const selection = this.env
        .model(relation)
        .execute_kw('name_search', [], { args: domain })
      return selection
    }
  }

  // ok // call by _browse
  static async _get_field_onchange(view_form_xml_id, from_record) {
    if (from_record) {
      const [parent, field] = from_record
      if (!parent.field_onchange) {
        return null
      }

      const columns = Object.keys(parent.field_onchange)
      const field_onchange = columns.reduce((acc, col) => {
        const split_col = col.split('.')
        if (split_col.length === 2 && split_col[0] === field.name) {
          acc[split_col[1]] = parent.field_onchange[col]
        }
        return acc
      }, {})
      return field_onchange
    }

    if (!view_form_xml_id) {
      return null
    }

    const field_onchange0 = this._field_onchanges[view_form_xml_id]
    if (field_onchange0) {
      return field_onchange0
    }

    const view_id =
      view_form_xml_id.split('.').length > 1
        ? (await this.env.ref(view_form_xml_id)).id
        : null

    const args = view_id ? [view_id] : []
    const view_info = await this.execute('fields_view_get', ...args)
    const field_onchange = this._onchange_spec(view_info)
    this._field_onchanges[view_form_xml_id] = field_onchange

    return field_onchange
  }

  // ok // call by _get_field_onchange
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

    const root = xml2json.toJSON(view_info.arch)
    process(root, view_info, '')
    return result
  }

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
  async _default_get_onchange(values = {}, field_onchange = {}) {
    const fields = Object.keys(field_onchange).filter(
      fld => fld.split('.').length === 1
    )
    const default_get = await this.constructor.execute('default_get', fields)

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

    // # TBD: default_get 里面 可能有 m2o o2m 需要处理
    const values_onchange = { ...values_onchange2, ...values, ...default_get }

    if (this._from_record) {
      const [parent, field] = this._from_record
      const parent_vals = parent._get_values_for_onchange({ for_parent: true })
      values_onchange[field.relation_field] = parent_vals
    }

    const field_name = fields
    const args = [[], values_onchange, field_name, field_onchange]
    const onchange = await this.constructor.execute('onchange', ...args)

    const default_get2 = Object.keys(default_get).reduce((acc, cur) => {
      const meta = this._columns[cur]
      const value = default_get[cur]
      acc[cur] = meta.type === 'many2one' && value ? [value, ''] : value
      return acc
    }, {})

    const values_ret = { ...values, ...default_get2, ...onchange.value }
    const onchange2 = { ...onchange, value: values_ret }
    return onchange2
  }
}
