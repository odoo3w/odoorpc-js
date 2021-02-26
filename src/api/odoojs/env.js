import { Model } from './models'
import { generate_field } from './fields'

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

  async ref(xml_id) {
    const [model, id_] = this._odoo.execute(
      'ir.model.data',
      'xmlid_to_res_model_res_id',
      xml_id,
      true
    )

    const Model = await this.model(model)
    return Model.browse(id_)
  }

  get uid() {
    return this._uid
  }

  get user() {
    return this.model('res.users').browse(this.uid)
  }

  get registry() {
    return this._registry
  }

  model(model) {
    // console.log('env model', model)
    if (!Object.keys(this._registry).includes(model)) {
      this._registry[model] = this._create_model_class(model)
    }
    return this._registry[model]
  }

  async copy() {
    //
  }

  _create_model_class(model) {
    const cls_name = model.replace('.', '_')

    // field_get is promise
    const field_get = this._odoo.execute(model, 'fields_get')

    const columns = new Promise(resolve => {
      field_get.then(fg => {
        const cols = Object.keys(fg).reduce((acc, field_name) => {
          if (!FIELDS_RESERVED.includes(field_name)) {
            const Field = generate_field(field_name, fg[field_name])
            acc[field_name] = Field
          }

          return acc
        }, {})

        if (!cols.name) {
          const field_data = { type: 'text', string: 'Name', readonly: true }
          const Field = generate_field('name', field_data)
          cols.name = Field
        }

        resolve(cols)
      })
    })

    class Cls extends Model {
      constructor() {
        super()
        const myClass = this.constructor

        this._init_ok_promise = new Promise(resolve => {
          const init_ok = myClass._init_ok_promise
          init_ok.then(() => {
            Object.keys(myClass._columns).forEach(item => {
              const Field = myClass._columns[item]
              myClass.prototype.__defineGetter__(`$${item}`, function() {
                return Field.value(this)
              })
              // Cls.prototype.__defineGetter__('name', function() {
              //   return this._name
              // })
              // Cls.prototype.__defineSetter__('name', function(value) {
              //   this._name = value
              // })
            })
            resolve(true)
          })
        })
      }

      static get env() {
        // console.log(' CLss env,', this)
        // console.log(' CLss env 1,', this._name)
        return this._env
      }
    }

    Object.defineProperty(Cls, 'name', { value: cls_name })
    Cls._env = this
    Cls._odoo = this._odoo
    Cls._name = model
    Cls._columns = []

    Cls._init_ok_promise = new Promise(resolve => {
      // console.log(' cls init 1')
      columns.then(cols => {
        // console.log(' cls init 2', cols)
        Cls._columns = cols
        Object.keys(cols).forEach(item => {
          const Field = cols[item]
          Cls[`$${item}`] = Field
        })
        resolve(true)
      })
    })

    // Cls._init_ok_promise.then(() => {
    //   console.log(' cls init ok')
    // })

    return Cls
  }
}
