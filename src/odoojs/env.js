import { Model } from './models.js'
import { generate_field } from './fields.js'

const FIELDS_RESERVED = ['id', 'ids', '__odoo__', '__osv__', '__data__', 'env']

export class Environment {
  constructor(odoo, db, uid, kwargs = {}) {
    const { context } = kwargs
    this._odoo = odoo
    this._db = db
    this._uid = uid
    this._context = context
    this._registry = {}
  }

  get context() {
    return this._context
  }

  get db() {
    return this._db
  }

  get lang() {
    return this.context.lang
  }

  async ref(xml_id, payload = {}) {
    const args = ['ir.model.data', 'xmlid_to_res_model_res_id', xml_id, true]
    const [model, id_] = await this._odoo.execute(...args)
    const { return_model } = payload
    if (return_model) {
      const Model = this.model(model)
      return Model.browse(id_)
    } else {
      return { _name: model, id: id_ }
    }
  }

  get uid() {
    return this._uid
  }

  get user() {
    // user is a promise
    return this.model('res.users').browse(this.uid)
  }

  get registry() {
    return this._registry
  }

  // same to __getitem__ of python
  model(model) {
    // console.log('env model', model)
    if (!Object.keys(this._registry).includes(model)) {
      this._registry[model] = this._create_model_class(model)
    }
    return this._registry[model]
  }

  // same to __call__ of python
  copy(context) {
    const context2 = context ? context : this.context
    const env = new this.constructor(this._odoo, this._db, this._uid, {
      context: context2
    })
    env._registry = this._registry
    return env
  }

  // same to __contains__ of python
  async includes(model) {
    const domain = [['model', '=', model]]
    const model_exists = await this._odoo.execute('ir.model', 'search', domain)
    return model_exists.length ? true : false
  }

  _create_model_class(model) {
    const cls_name = model.replace('.', '_')
    // field_get is promise
    const field_get = this._odoo.execute(model, 'fields_get')

    const _get_cols_from_field_get = fg => {
      const cols = Object.keys(fg).reduce((acc, field_name) => {
        if (!FIELDS_RESERVED.includes(field_name)) {
          const Field = generate_field(field_name, fg[field_name])
          acc[field_name] = Field
        }

        return acc
      }, {})

      // this is a bug in odoorpc
      // 'display_name' field is ok,
      // if (!cols.name) {
      //   const field_data = { type: 'text', string: 'Name', readonly: true }
      //   const Field = generate_field('name', field_data)
      //   cols.name = Field
      // }
      return cols
    }

    // metadata from odoo call fields_get
    const columns = new Promise(resolve => {
      field_get.then(fg => {
        const cols = _get_cols_from_field_get(fg)
        resolve(cols)
      })
    })

    class Cls extends Model {
      constructor() {
        super()
        this._set_ok_promises = []
        const _defineGetter = () => {
          const cols = this.constructor._columns
          Object.keys(cols).forEach(item => {
            const Field = cols[item]
            const my_prototype = this.constructor.prototype
            my_prototype.__defineGetter__(`$${item}`, function() {
              return Field.value(this)
            })

            my_prototype.__defineSetter__(`$${item}`, function(value) {
              // console.log('set field', item, value)
              const set_ok = Field.setValue(this, value)
              // // set_o is a promise
              this._set_ok_promises.push(set_ok)
              // console.log('set ok', set_ok)
            })
          })
        }

        // step 5: define a boolean flag, wait for instance columns init finished
        this._init_ok_promise = new Promise(resolve => {
          // wait for class columns init ok, then set instance columns
          this.constructor._init_ok_promise.then(() => {
            _defineGetter()
            resolve(true)
          })
        })
      }

      static async init() {
        // step 4: an api,  wait for class columns init finished
        return this._init_ok_promise
      }

      async init() {
        // step 6: an api, wait for instance columns init finished
        return this._init_ok_promise
      }

      async wait_set() {
        // this._set_ok_promises is promise list
        //  wait for all fields set trigger onchange finished
        while (this._set_ok_promises.length) {
          const one = this._set_ok_promises.shift()
          await one
        }
      }
    }

    // step 1: define a new model class, to set _env, _odoo, _name
    Object.defineProperty(Cls, 'name', { value: cls_name })
    Cls._env = this
    Cls._odoo = this._odoo
    Cls._name = model
    Cls._columns = {}

    // step 2: all columns from odoo call fields_get
    Cls._columns_promise = columns

    // step 3: define a boolean flag, wait for class columns init finished
    Cls._init_ok_promise = new Promise(resolve => {
      // console.log('env, cls in _init_ok_promise')
      Cls._columns_promise.then(cols => {
        // console.log('env, cls  in _columns_promise')
        Cls._columns = cols
        Object.keys(cols).forEach(item => {
          const Field = cols[item]
          Cls[`$${item}`] = Field
        })
        resolve(true)
      })
    })

    return Cls
  }
}
