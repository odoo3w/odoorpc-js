import { Action } from './action'

import { View } from './view'

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
console.log('xxxx AllModels,', AddonsModels)

const FIELDS_RESERVED = ['id', 'ids', '__odoo__', '__osv__', '__data__', 'env']

export class Environment {
  constructor(odoo, db, uid, kwargs = {}) {
    const { context, addons = {} } = kwargs
    this._odoo = odoo

    this._addons = addons

    this._db = db
    this._uid = uid
    this._context = context
    this._registry = {}

    this._model_registry = undefined
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

  async _set_model_registry() {
    if (!this._model_registry) {
      const domain = []
      const model = 'ir.model'
      const method = 'search_read'
      const kwargs = { domain, fields: ['model'] }
      const model_ids = await this._odoo.execute_kw(model, method, [], kwargs)

      this._model_registry = model_ids.reduce((acc, cur) => {
        acc[cur.model] = cur.id
        return acc
      }, {})
    }
  }

  get_model_id(model) {
    return this._model_registry[model]
  }

  async action(xml_id, additional_context = {}) {
    return Action.load(this, xml_id, additional_context)
  }

  action_get(payload = {}) {
    return Action.load_sync(this, payload)
  }

  view_get(payload = {}) {
    return View.view_get(this, payload)
  }

  // same to __getitem__ of python

  _model(payload) {
    const { model, fields } = payload
    if (!Object.keys(this._registry).includes(model)) {
      const MyClass = this._create_model_class_with_fields(payload)
      this._registry[model] = MyClass
    } else {
      const MyClass = this._registry[model]
      MyClass._update_sync(fields)
    }
    return this._registry[model]
  }

  model(model) {
    return this._model({ model, fields: {} })
  }

  // same to __call__ of python
  copy(context) {
    const context2 = context ? context : this.context
    const env = new this.constructor(this._odoo, this._db, this._uid, {
      context: context2
    })
    env._registry = this._registry
    env._model_registry = this._model_registry

    return env
  }

  // same to __contains__ of python
  async includes(model) {
    const domain = [['model', '=', model]]
    const model_exists = await this._odoo.execute('ir.model', 'search', domain)
    return model_exists.length ? true : false
  }

  _create_model_class_with_fields(payload) {
    const { model, fields } = payload
    const Model2 = this._addons[model] || AllModels[model] || Model

    class Cls extends Model2 {
      constructor() {
        super()
        this._instance_awaiters = []

        const cols = this.constructor._columns
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
          // 初始化时, 除 relation 字段外的普通字段, 都已经 read 返回数据
          // 普通字段, 只用单$函数, 同步读取足够.
          // relation 字段:
          // 单$函数, 同步读取已经初始化的数据
          // m2m字段, 双$$函数, 异步读取 [{id,display_name}]
          // m2o字段, 双$$函数, 异步读取 ...,
          // o2m字段, 双$$函数, 异步读取 ...,

          my_prototype.__defineGetter__(`$${item}`, getter)
          my_prototype.__defineSetter__(`$${item}`, setter)

          // 双 $$ 函数
          if (Field.relation) {
            const $$getter = function() {
              return Field.$$getValue(this)
            }
            my_prototype.__defineGetter__(`$$${item}`, $$getter)
            my_prototype.__defineSetter__(`$$${item}`, setter)
          }
        })
      }

      get awaiter() {
        const _wait_awaiter = async () => {
          while (this._instance_awaiters.length) {
            const one = this._instance_awaiters.shift()
            await one
          }
        }
        return _wait_awaiter()
      }

      static _init_columns(fields) {
        const _get_cols_from_field_get = fg => {
          const cols = Object.keys(fg).reduce((acc, field_name) => {
            if (!FIELDS_RESERVED.includes(field_name)) {
              acc[field_name] = generate_field(field_name, fg[field_name])
            }
            return acc
          }, {})

          if (!cols.display_name) {
            const field_data = { type: 'text', string: 'Name', readonly: true }
            const Field = generate_field('display_name', field_data)
            cols.display_name = Field
          }
          return cols
        }

        const fields2 = Object.keys(fields).reduce((acc, cur) => {
          if (!this._columns[cur]) {
            acc[cur] = fields[cur]
          }
          return acc
        }, {})

        const cols = _get_cols_from_field_get(fields2)

        Object.keys(cols).forEach(item => {
          const Field = cols[item]
          this._columns[item] = Field
          Cls[`$${item}`] = Field
        })
      }

      static _update_sync(fields) {
        const fields2 = Object.keys(fields).reduce((acc, cur) => {
          if (!(cur in this._columns)) {
            acc[cur] = fields[cur]
          }
          return acc
        }, {})

        this._init_columns(fields2)
      }

      static async update(fields_in = []) {
        if (this._fields_get_is_all) {
          return
        }

        const fields1 = Array.isArray(fields_in)
          ? fields_in
          : Object.keys(fields_in)

        const is_call_all = !fields1.length

        const fields = fields1.filter(
          item => item !== 'id' && !(item in this._columns)
        )

        if (is_call_all || fields.length) {
          const fields_get = await this._odoo.execute_kw(
            model,
            'fields_get',
            [fields],
            { context: this.context }
          )

          this._init_columns(fields_get)
        }

        if (is_call_all) {
          this._fields_get_is_all = true
        }
      }
    }

    const cls_name = model.replace('.', '_')
    Object.defineProperty(Cls, 'name', { value: cls_name })
    Cls._env = this
    Cls._odoo = this._odoo
    Cls._name = model
    Cls._model_id = this.get_model_id(model)

    Cls._columns = {}
    Cls._default_view = { form: undefined, tree: undefined }
    Cls._fields_get_is_all = false

    Cls._init_columns(fields)

    return Cls
  }
}

export const _get_all_fields2 = view_info => {
  const list2 = ['domain', 'modifiers', 'context', 'options']
  const result = list2.reduce((acc, cur) => {
    acc[cur] = []
    return acc
  }, {})

  const fields = _get_all_fields(view_info)
  list2.forEach(item => {
    Object.keys(fields).forEach(fld => {
      const attrs = fields[fld]
      if (attrs[item]) {
        result[item].push([fld, attrs[item]])
        // result[`${fld},${item}`] = attrs[item]
        // result[`${fld},${item}: `] = [typeof attrs[item], attrs[item]]
        // console.log(fld, ',', item, ': ', attrs[item])
      }
    })
  })

  // Object.keys(fields).forEach(fld => {
  //   const attrs = fields[fld]
  //   list2.forEach(item => {
  //     if (attrs[item]) {
  //       result[`${fld},${item}`] = attrs[item]
  //       // result[`${fld},${item}: `] = [typeof attrs[item], attrs[item]]
  //       // console.log(fld, ',', item, ': ', attrs[item])
  //     }
  //   })
  // })

  return result
}

export const _get_all_fields = view_info => {
  const result = {}

  const process = (node, info, prefix) => {
    if (node.tagName === 'field') {
      const name = node.attrs.name
      const names_list = prefix ? [prefix, name] : [name]
      const names = names_list.join('.')
      if (!Object.keys(result).includes(names)) {
        result[names] = node.attrs
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
