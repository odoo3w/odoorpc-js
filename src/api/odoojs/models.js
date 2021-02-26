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

export class Model {
  constructor() {
    this._env_local = null
    this._from_record = null
    this._ids = []
    this._values = {} // {field: {ID: value}}
    this._values_to_write = {} // {field: {ID: value}}

    Object.keys(this.constructor._columns).forEach(field => {
      this._values[field] = {}
      this._values_to_write[field] = {}
    })

    // 定义 迭代方法
    this[Symbol.iterator] = () => {
      let index = 0
      const that = this
      return {
        next() {
          if (index < that.ids.length) {
            const one_record = that.constructor._browse_iterated(
              that.env,
              that.ids[index],
              that
            )
            index++
            return { value: one_record, done: false }
          } else {
            return { value: undefined, done: true }
          }
        }
      }
    }

    // this.with_context = this._with_context
    // this.with_env = this._with_env
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

    await this._init_ok_promise
    const records = new this()
    await records._init_ok_promise
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
    return this._browse(this.env, ids)
  }

  static with_context() {
    //
  }

  _with_context() {
    //
  }

  static with_env() {
    //
  }

  _with_env() {
    //
  }

  async _init_values(paylaod = {}) {
    //
    // console.log('_init_values 1, ', this, this.env)

    const { context = this.env.context } = paylaod

    // console.log('_init_values 1, ', this)
    const columns = this.constructor._columns
    const basic_fields = Object.keys(columns).reduce((acc, cur) => {
      // 应该特殊处理 二进制字段
      acc = [...acc, cur]
      return acc
    }, [])

    // console.log('_init_values 1, ', this.ids, basic_fields, context)

    if (this.ids.length) {
      const result = await this.read(basic_fields, {
        context,
        load: '_classic_write'
      })
      result.forEach(row => {
        Object.keys(row).forEach(field_name => {
          if (field_name !== 'id') {
            this._values[field_name][row.id] = row[field_name]
          }
        })
      })
    }

    // console.log('_init_values 1, ', result)
  }

  static async execute_kw(method, args = [], kwargs = {}) {
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
    return this.execute_kw(method, [this.ids, ...args], {})
  }

  async read(fields, kwargs) {
    const method = 'read'
    return this.execute_kw(method, [fields], kwargs)
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
