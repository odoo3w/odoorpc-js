import { Model } from './models.js'
import { generate_field } from './fields.js'

const AddonsFiles = require.context('./addons', true, /\.js$/)

// you do not need `import sale from './addons/sale'`
// it will auto require all odoo model from addons file
const AddonsModels = AddonsFiles.keys().reduce((models, modulePath) => {
  // const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
  const value = AddonsFiles(modulePath)
  models = { ...models, ...value.default }
  return models
}, {})

const AllModels = { ...AddonsModels }
// console.log('xxxx,', AddonsModels)

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
      const ref_Model = this.model(model)
      return ref_Model.browse(id_)
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
  model(model, view_type, view_ref) {
    //// 根据 xml_id, 查找 ir.ui.view. 获得 model name
    // 创建 model 时, 先做 fields_view_get 代替 fields_get
    // 使用 fields_view_get 返回的 fields 生成 model class 的 _columns
    // 将 fields_view_get 返回的 arch 记录备案
    // 这样处理 以代替原有的方法:
    // Model = odoo.env.model(model_name)
    // view_info = Model.fields_view_get 这两步操作
    // 这种方法 创建的 Model, 在使用 Model._columns[relation_field_name].relation
    // 创建 relation Model 时, 需要上述 arch 里 relation 字段的 fields 列表

    // model: model name  like: sale.order
    // view_type: tree, form
    // view_ref:split by dot, module.xml_id, like: sale.view_order_form

    const reg_name_list = [model, view_type]
    if (view_type) {
      reg_name_list.push(view_type)
      if (view_ref) {
        reg_name_list.push(view_ref)
      }
    }

    const reg_name = reg_name_list.join(',')

    if (!Object.keys(this._registry).includes(reg_name)) {
      this._registry[reg_name] = this._create_model_class(
        model,
        view_type,
        view_ref
      )
    }
    return this._registry[reg_name]
  }

  // same to __call__ of python
  copy(context) {
    const context2 = context ? context : this.context
    const env = new this.constructor(this._odoo, this._db, this._uid, {
      context: context2,
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

  _create_model_class(model, view_type, view_ref) {
    const call_fields_view_get = () =>
      this._odoo.execute_kw(model, 'fields_view_get', [], {
        view_type,
        context: view_ref
          ? { ...this.context, [`${view_type}_view_ref`]: view_ref }
          : this.context,
      })
    const call_fields_get = () =>
      new Promise((resolve) =>
        this._odoo
          .execute_kw(model, 'fields_get', [], { context: this.context })
          .then((fields) => resolve({ fields }))
      )

    const _get_cols_from_field_get = (fg) => {
      const cols = Object.keys(fg).reduce((acc, field_name) => {
        if (!FIELDS_RESERVED.includes(field_name)) {
          acc[field_name] = generate_field(field_name, fg[field_name])
        }
        return acc
      }, {})

      // this is a bug in odoorpc.  'display_name' field is ok,
      // if (!cols.name) {
      //   const field_data = { type: 'text', string: 'Name', readonly: true }
      //   const Field = generate_field('name', field_data)
      //   cols.name = Field
      // }
      return cols
    }

    // AllModels
    const Model2 = AllModels[model] || Model

    class Cls extends Model2 {
      constructor() {
        super()
        this._instance_awaiters = []

        const _defineGetter = () => {
          const cols = this.constructor._columns
          Object.keys(cols).forEach((item) => {
            const Field = cols[item]
            const my_prototype = this.constructor.prototype

            my_prototype.__defineGetter__(`$${item}`, function() {
              return Field.getValue(this)
            })

            my_prototype.__defineSetter__(`$${item}`, function(value) {
              const set_ok = Field.setValue(this, value) // set_ok is a promise
              this._instance_awaiters.push(set_ok)
            })
          })
        }

        // step 5: define a boolean flag, wait for instance columns init finished
        const _init_ok = new Promise((resolve) => {
          // wait for class columns init ok, then set instance columns
          this.constructor.awaiter.then(() => {
            _defineGetter()
            resolve(true)
          })
        })
        this._instance_awaiters.push(_init_ok)
      }

      // step 6: an api, wait for instance columns init finished
      get awaiter() {
        const _wait_awaiter = async () => {
          // this._instance_awaiters is promise list
          // wait for 1:_init_ok, 2: all fields set trigger onchange finished
          while (this._instance_awaiters.length) {
            const one = this._instance_awaiters.shift()
            await one
          }
        }
        return _wait_awaiter()
      }

      get _view_info() {
        return this.constructor._view_info
      }
    }

    const cls_name = model.replace('.', '_')

    // step 1: define a new model class, to set _env, _odoo, _name
    Object.defineProperty(Cls, 'name', { value: cls_name })
    Cls._env = this
    Cls._odoo = this._odoo
    Cls._name = model

    // step 2: all columns from odoo call fields_get
    Cls._columns = {}
    Cls._view_info = {}

    const fields_view = view_type ? call_fields_view_get() : call_fields_get()

    // step 3: define a boolean flag, wait for class columns init finished
    const _cls_init_ok = new Promise((resolve) => {
      fields_view.then((fv) => {
        // console.log('env, cls  in _columns_promise')
        const cols = _get_cols_from_field_get(fv.fields)
        Cls._view_info = fv
        Cls._columns = cols
        Object.keys(cols).forEach((item) => {
          const Field = cols[item]
          Cls[`$${item}`] = Field
        })

        resolve(true)
      })
    })

    Cls._awaiters = []
    Cls._awaiters.push(_cls_init_ok)

    // step 4: an api,  wait for class columns init finished
    Cls.awaiter = new Promise((resolve) => {
      const _wait = async () => {
        while (Cls._awaiters.length) {
          await Cls._awaiters.shift()
        }
      }
      resolve(_wait())
    })

    return Cls
  }

  // _create_model_class2(model) {
  //   const cls_name = model.replace('.', '_')
  //   const field_get = this._odoo.execute_kw(model, 'fields_get', [], {
  //     context: this.context
  //   })

  //   const _get_cols_from_field_get = fg => {
  //     const cols = Object.keys(fg).reduce((acc, field_name) => {
  //       if (!FIELDS_RESERVED.includes(field_name)) {
  //         const Field = generate_field(field_name, fg[field_name])
  //         acc[field_name] = Field
  //       }

  //       return acc
  //     }, {})

  //     // this is a bug in odoorpc.  'display_name' field is ok,
  //     // if (!cols.name) {
  //     //   const field_data = { type: 'text', string: 'Name', readonly: true }
  //     //   const Field = generate_field('name', field_data)
  //     //   cols.name = Field
  //     // }
  //     return cols
  //   }

  //   // metadata from odoo call fields_get
  //   const columns = new Promise(resolve => {
  //     field_get.then(fg => {
  //       // Object.keys(fg).forEach(item => {
  //       //   if (fg[item].type === 'one2many' || fg[item].type === 'many2many') {
  //       //     console.log('field_get, ', item, fg[item])
  //       //   }
  //       // })
  //       const cols = _get_cols_from_field_get(fg)
  //       resolve(cols)
  //     })
  //   })

  //   // AllModels
  //   const Model2 = AllModels[model] || Model

  //   class Cls extends Model2 {
  //     constructor() {
  //       super()
  //       this._instance_awaiters = []

  //       const _defineGetter = () => {
  //         const cols = this.constructor._columns
  //         Object.keys(cols).forEach(item => {
  //           const Field = cols[item]
  //           const my_prototype = this.constructor.prototype

  //           my_prototype.__defineGetter__(`$${item}`, function() {
  //             return Field.getValue(this)
  //           })

  //           my_prototype.__defineSetter__(`$${item}`, function(value) {
  //             const set_ok = Field.setValue(this, value) // set_ok is a promise
  //             this._instance_awaiters.push(set_ok)
  //           })
  //         })
  //       }

  //       // step 5: define a boolean flag, wait for instance columns init finished
  //       const _init_ok = new Promise(resolve => {
  //         // wait for class columns init ok, then set instance columns
  //         this.constructor.awaiter.then(() => {
  //           _defineGetter()
  //           resolve(true)
  //         })
  //       })
  //       this._instance_awaiters.push(_init_ok)
  //     }

  //     // step 6: an api, wait for instance columns init finished
  //     get awaiter() {
  //       const _wait_awaiter = async () => {
  //         // this._instance_awaiters is promise list
  //         // wait for 1:_init_ok, 2: all fields set trigger onchange finished
  //         while (this._instance_awaiters.length) {
  //           const one = this._instance_awaiters.shift()
  //           await one
  //         }
  //       }
  //       return _wait_awaiter()
  //     }
  //   }

  //   // step 1: define a new model class, to set _env, _odoo, _name
  //   Object.defineProperty(Cls, 'name', { value: cls_name })
  //   Cls._env = this
  //   Cls._odoo = this._odoo
  //   Cls._name = model
  //   Cls._columns = {}

  //   // step 2: all columns from odoo call fields_get
  //   Cls._columns_promise = columns

  //   Cls._awaiters = []

  //   // step 3: define a boolean flag, wait for class columns init finished
  //   const _cls_init_ok = new Promise(resolve => {
  //     Cls._columns_promise.then(cols => {
  //       // console.log('env, cls  in _columns_promise')
  //       Cls._columns = cols
  //       Object.keys(cols).forEach(item => {
  //         const Field = cols[item]
  //         Cls[`$${item}`] = Field
  //       })
  //       resolve(true)
  //     })
  //   })

  //   Cls._awaiters.push(_cls_init_ok)

  //   // step 4: an api,  wait for class columns init finished
  //   Cls.awaiter = new Promise(resolve => {
  //     const _wait = async () => {
  //       while (Cls._awaiters.length) {
  //         const one = Cls._awaiters.shift()
  //         await one
  //       }
  //     }
  //     resolve(_wait())
  //   })

  //   return Cls
  // }
}
