import { Model } from './models.js'
import { generate_field } from './fields.js'

import xml2json from './xml2json.js'

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

//
// call by env _init_columns fields_view_get
//

const _onchange_spec = view_info => {
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

  const res2 = { ...result }
  delete res2.id
  // console.log('res,', res2)

  return res2
}

export class Environment {
  constructor(odoo, db, uid, kwargs = {}) {
    const { context, addons = {} } = kwargs
    this._odoo = odoo

    this._addons = addons

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

  model(model, view_type2, view_ref) {
    // console.log('env,model', model, view_type2, view_ref)
    if (view_ref && typeof view_ref === 'object') {
      return this._model_from_parent(model, view_type2, view_ref)
    } else {
      const view_type = view_type2 || 'form'
      const reg_name_list = [model]
      if (view_type) {
        reg_name_list.push(view_type)
        if (view_ref) {
          reg_name_list.push(view_ref)
        }
      }

      const reg_name = reg_name_list.join(',')

      return this._model_get(model, reg_name, { view_type, view_ref })
    }
  }

  _model_from_parent(model, view_type, { isSync, view_info }) {
    // const [parent, field] = from_record
    // console.log(
    //   'xxxxxxx, _model_from_parent',
    //   model,
    //   view_type,
    //   isSync,
    //   view_info
    // )

    // console.log('_model_by_view_info', view_info, field.name)

    return this._create_model_class(model, { view_type, isSync, view_info })

    // const reg_name_list = [model]
    // reg_name_list.push('relation')
    // reg_name_list.push(parent._name)
    // reg_name_list.push(parent.id)
    // reg_name_list.push(field.name)
    // reg_name_list.push(view_type)

    // const reg_name = reg_name_list.join(',')

    // return this._model_get(model, reg_name, { isSync, view_info })
  }

  _model_get(model, reg_name, { view_type, view_ref }) {
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

    // view_type ,view_ref
    // 0,0 = form
    // 1,0 = form or tree
    // 0,1 = 依赖于 view_ref

    // reg_name_list = [model, 'view_type', 'view_ref']
    // o2m 子 模型
    // reg_name_list = [model, '', '','parent','view_type', 'view_ref']

    if (!Object.keys(this._registry).includes(reg_name)) {
      const MyClass = this._create_model_class(model, { view_type, view_ref })
      this._registry[reg_name] = MyClass
    }
    return this._registry[reg_name]
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

  _create_model_class(model, payload = {}) {
    const { view_type, view_ref, isSync, view_info } = payload
    const Model2 = this._addons[model] || AllModels[model] || Model

    // console.log(
    //   'xxxxxxx, _create_model_class',
    //   model,
    //   view_type,
    //   isSync,
    //   view_info
    // )

    // console.log('xxxxxxx, _create_model_class', [Model2])

    class Cls extends Model2 {
      constructor() {
        super()
        this._instance_awaiters = []

        const _defineGetter = () => {
          const cols = this.constructor._columns
          // console.log('xxxgetter,xxx, ', this._name, this.ids)
          Object.keys(cols).forEach(item => {
            const Field = cols[item]
            const my_prototype = this.constructor.prototype

            const getter = function() {
              return Field.getValue(this)
            }

            const setter = function(value) {
              const set_ok = Field.setValue(this, value) // set_ok is a promise
              this._instance_awaiters.push(set_ok)
            }

            my_prototype.__defineGetter__(`$${item}`, getter)
            my_prototype.__defineSetter__(`$${item}`, setter)

            // 双 $$ 为异步函数
            if (Field.relation) {
              const async_getter = function() {
                return Field.asyncGetValue(this)
              }
              my_prototype.__defineGetter__(`$$${item}`, async_getter)
              my_prototype.__defineSetter__(`$$${item}`, setter)
            }
          })
        }

        if (isSync) {
          _defineGetter()
        } else {
          // step 5: define a boolean flag, wait for instance columns init finished
          const _init_ok = new Promise(resolve => {
            // wait for class columns init ok, then set instance columns
            this.constructor.awaiter.then(() => {
              _defineGetter()
              resolve(true)
            })
          })
          this._instance_awaiters.push(_init_ok)
        }
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

      get _view_type() {
        return this.constructor._view_type
      }

      get _view_info() {
        return this.constructor._view_info
      }

      get _field_onchange() {
        return this.constructor._field_onchange
      }

      static _init_columns(view_info) {
        this._view_info = view_info
        this._field_onchange = _onchange_spec(view_info)
        const _get_cols_from_field_get = fg => {
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

        const cols = _get_cols_from_field_get(view_info.fields)
        this._columns = cols
        // console.log('col,', this._name, this._columns)
        Object.keys(cols).forEach(item => {
          const Field = cols[item]
          Cls[`$${item}`] = Field
        })
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

    Cls._view_type = view_type
    Cls._view_info = {}
    Cls._field_onchange = {}

    Cls._awaiters = []
    // Cls.isSync = isSync

    const _init_columns_async = async () => {
      const _get_view_info = async () => {
        const model = Cls._name

        if (view_type) {
          return await this._odoo.execute_kw(model, 'fields_view_get', [], {
            view_type,
            context: view_ref
              ? { ...this.context, [`${view_type}_view_ref`]: view_ref }
              : this.context
          })
        } else {
          return {
            fields: await this._odoo.execute_kw(model, 'fields_get', [], {
              context: this.context
            })
          }
        }
      }

      const view_info = await _get_view_info()
      Cls._init_columns(view_info)
    }

    const _get_init_ok = () => {
      // console.log('create model,', model, view_info)
      if (view_info) {
        Cls._init_columns(view_info)

        return new Promise(resolve => resolve())
      } else {
        return _init_columns_async()
      }
    }

    // step 3: define a boolean flag, wait for class columns init finished
    const _cls_init_ok = _get_init_ok()

    Cls._awaiters.push(_cls_init_ok)

    // step 4: an api,  wait for class columns init finished
    Cls.awaiter = new Promise(resolve => {
      const _wait = async () => {
        while (Cls._awaiters.length) {
          await Cls._awaiters.shift()
        }
      }
      resolve(_wait())
    })

    return Cls
  }
}
