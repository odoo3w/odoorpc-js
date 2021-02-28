// NORMALIZED_TYPES = (int, str, bytes)

// const FIELDS_RESERVED = ['id', 'ids', '__odoo__', '__osv__', '__data__', 'env']

const _normalize_ids = ids => {
  if (!ids) {
    return []
  }

  if (Array.isArray(ids)) {
    return ids
  }

  return [ids]
}

export class IncrementalRecords {
  // """A helper class used internally by __iadd__ and __isub__ methods.
  // Afterwards, field descriptors can adapt their behaviour when an instance of
  // this class is set.
  // """
  // def __init__(self, tuples):
  // self.tuples = tuples
  constructor(tuples) {
    this.tuples = tuples
  }
}

export class BaseModel {
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
            // console.log(index, one.id, one.$display_name, that.ids)
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

export class Model extends BaseModel {
  constructor() {
    super()
    this._env_local = null
    this._from_record = null
    this._ids = []
    this._values = {} // {field: {ID: value}}
    this._values_to_write = {} // {field: {ID: value}}

    Object.keys(this.constructor._columns).forEach(field => {
      this._values[field] = {}
      this._values_to_write[field] = {}
    })
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

  //
  static _browse_iterated(env, ids, iterated) {
    // 迭代 返回的 不是 promise
    const records = new this()
    records._env_local = env
    records._ids = _normalize_ids(ids)

    records._values = iterated._values
    records._values_to_write = iterated._values_to_write
    records._from_record = iterated._from_record
    return records
  }

  static async _browse(env, ids, payload = {}) {
    // 访问网络, 返回的 是 promise
    const { from_record } = payload

    await this.init()
    const records = new this()
    await records.init()
    records._env_local = env
    records._ids = _normalize_ids(ids)

    const xml_id = undefined

    if (xml_id) {
      //
    } else {
      records._from_record = from_record
      records._values = {}
      records._values_to_write = {}
      Object.keys(this._columns).forEach(field => {
        records._values[field] = {}
        records._values_to_write[field] = {}
      })
      await records._init_values()
    }

    return records
  }

  static async browse(ids) {
    if (ids === undefined) {
      throw 'call browse without ids'
    }
    return this._browse(this.env, ids)
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
    // const res = this.constructor._browse_iterated(env, this.ids, this)
    const res = this.constructor._browse(env, this.ids)
    return res
  }

  async _init_values(paylaod = {}) {
    //
    // console.log('_init_values 1, ', this, this.ids)

    const { context = this.env.context } = paylaod

    // console.log('_init_values 1, ', this)
    const columns = this.constructor._columns
    const basic_fields = Object.keys(columns).reduce((acc, field_name) => {
      // 应该特殊处理 二进制字段
      const Field = columns[field_name]
      // console.log(field_name, Field)
      if (Field.type !== 'binary') {
        acc = [...acc, field_name]
      }
      return acc
    }, [])

    // console.log('_init_values 1, ', this.ids, basic_fields, context)

    if (this.ids.length) {
      const result = await this.read(basic_fields, {
        context,
        load: '_classic_write'
      })

      // console.log('read 999:', result)

      const ids_fetched = new Set()

      result.forEach(row => {
        Object.keys(row).forEach(field_name => {
          ids_fetched.add(row.id)
          if (field_name !== 'id') {
            this._values[field_name][row.id] = row[field_name]
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

    // console.log('_init_values 1, ', result)
  }

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
    await this.init()

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
}

// const getModelProxy = instance => {
//   return new Proxy(instance, {
//     get: function(target, prop, recevier) {
//       //   console.log('model instance get:', target, prop, recevier)
//       console.log('model instance get:', prop, typeof prop)
//       const cols = target.constructor._columns
//       if (typeof prop === 'string' && Object.keys(cols).includes(prop)) {
//         const Field = cols[prop]
//         console.log('model instance get:', prop, Field)
//         const value = Field._get(instance)
//         return value
//       } else {
//         console.log('model instance get 2', prop)
//         return target[prop]
//       }
//     }
//   })
// }
