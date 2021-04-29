import { Model } from './models.js'
import { generate_field } from './fields.js'

import xml2json from './xml2json.js'

const test_count = {}

const deep_copy = node => {
  return JSON.parse(JSON.stringify(node))
}

const get_attrs = node_attr => {
  const list2 = ['class']
  return Object.keys(node_attr).reduce((acc, cur) => {
    if (!list2.includes(cur)) {
      acc[cur] = node_attr[cur]
    }
    return acc
  }, {})
}

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
      const name = node.attrs.name
      const names_list = prefix ? [prefix, name] : [name]
      const names = names_list.join('.')
      if (!Object.keys(result).includes(names)) {
        result[names] = node.attrs.on_change || ''
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
      const reg_name2 = `(${reg_name})`

      return this._model_get(model, reg_name2, { view_type, view_ref })
    }
  }

  _model_from_parent(model, view_type, payload) {
    // console.log('_model_by_view_info', view_info, field.name)

    const {
      parant_reg_name = '(parent)',
      isSync,
      view_info,
      views = {}
    } = payload

    const reg_name_list = [model, view_type]
    const reg_name = reg_name_list.join(',')
    const reg_name2 = `(${reg_name});${parant_reg_name}`

    return this._model_get(model, reg_name2, {
      view_type,
      isSync,
      view_info,
      views
    })
  }

  _model_get(model, reg_name, payload) {
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
      const MyClass = this._create_model_class(model, { reg_name, ...payload })
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
    const {
      reg_name,
      view_type,
      view_ref,
      isSync,
      view_info,
      views = {}
    } = payload
    const Model2 = this._addons[model] || AllModels[model] || Model

    if (!test_count[model]) {
      test_count[model] = 1
    }
    test_count[model] = test_count[model] + 1

    // console.log('env,', test_count, model, view_type, view_ref)

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

            // 初始化时, 除 relation 字段外的普通字段, 都已经 read 返回数据
            // 普通字段, 只用单$函数, 同步读取足够.
            // relation 字段:
            // 1 m2o 字段, 初始化时, reed 返回 [id, display_name],
            //   用 单$ 函数, 可以读取 display_name
            // 2 m2m 字段, 初始化时, reed 返回 [ids],
            //   同步读取, 无意义, 因此定义 单$函数为异步函数, 读取 [{id,display_name}]
            //   编辑时, 只有 [6,0 ids] 这一种编辑方式
            //   如果需要读取其他字段, 则 使用 $$函数
            // 3 o2m 字段,  初始化时, reed 返回 [ids],
            //   同步读取, 无意义, 因此定义 单$函数为异步函数, 读取 [{id, ...}]
            //   字段 依据 view_info 中的定义
            //   定义 双$$函数, 为编辑用 同步函数

            my_prototype.__defineGetter__(`$${item}`, getter)
            my_prototype.__defineSetter__(`$${item}`, setter)

            // 双 $$ 函数
            if (Field.relation) {
              const $$getter = function() {
                return Field.$$GetValue(this)
              }
              my_prototype.__defineGetter__(`$$${item}`, $$getter)
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

      get _reg_name() {
        return this.constructor._reg_name
      }

      get _field_onchange() {
        return this.constructor._field_onchange
      }

      static _get_templates(node) {
        // console.log('get_templates', this._from_record)
        // return node
        const get_tmpl = () => {
          if (this._from_record) {
            const [parent, Field] = this._from_record
            return parent.get_templates(node, Field.name)
          }
          return this.get_templates(node)
        }

        const tmpl = get_tmpl()
        if (tmpl) {
          return xml2json.toJSON(tmpl)
        } else {
          return node
        }
      }

      // eslint-disable-next-line no-unused-vars
      static get_templates(node, field) {
        // console.log('get_templates', this._from_record)
        return null
      }

      static _view_node_default_html(node) {
        if (typeof node !== 'object') {
          return node
        }

        if (Array.isArray(node)) {
          return node
        }

        if (!node) {
          return node
        }

        if (node.tagName === 'field') {
          return this._view_node_field(node)
        }
        if (node.tagName === 'label') {
          return this._view_node_label(node)
        }

        if (node.tagName === 'templates') {
          const node3 = this._get_templates(node)
          return {
            ...node3,
            children: node3.children.map(item =>
              this._view_node_default_html(item)
            )
          }
        }

        return {
          tagName: node.tagName,
          attrs: { ...get_attrs(node.attrs) },
          class: node.attrs.class,
          children:
            !node.isParent && node.content
              ? [node.content]
              : (node.children || []).map(item =>
                  this._view_node_default_html(item)
                )
        }
      }

      static _view_node_label(node) {
        let string = ''
        if (node.attrs.for) {
          const meta = this._columns[node.attrs.for]
          string = node.attrs.string || meta.string
        } else {
          //
        }

        return {
          tagName: node.tagName,
          attrs: {
            ...get_attrs(node.attrs),
            string
          },
          class: node.attrs.class,
          children:
            !node.isParent && node.content
              ? [node.content]
              : (node.children || []).map(item =>
                  this._view_node_default_html(item)
                )
        }
      }

      // ok
      static _view_node_field(node) {
        const meta = this._columns[node.attrs.name]
        const string = (meta && meta.string) || ''
        return {
          tagName: node.tagName,
          attrs: {
            ...get_attrs(node.attrs),
            string: node.attrs.string || string
          },
          class: node.attrs.class
        }
      }

      static _get_view_node(node) {
        const node_form = this._view_node_default_html(node)

        // const node_form2 = deep_copy(node_form)
        // console.log('node_form', node_form2)

        return { ...node_form }
      }

      static _get_view_node2() {
        const arch1 = this._view_info.arch
        // console.log('this._view_info 1', deep_copy(this._view_info))
        if (!arch1) {
          return {}
        }
        const node = xml2json.toJSON(arch1)
        // console.log('this._view_info arch11', arch1)
        console.log('view_node 1', deep_copy(node))
        return this._get_view_node(node)
      }

      static _init_columns(view_info, views = {}) {
        this._view_info = view_info
        this._views = views

        const fields1 = view_info.fields
        const fields2 = Object.keys(views).reduce((acc, cur) => {
          const cur_fields = views[cur].fields || {}
          return { ...acc, ...cur_fields }
        }, {})

        const fields = { ...fields2, ...fields1 }

        this._field_onchange = _onchange_spec({ ...view_info, fields })
        const _get_cols_from_field_get = fg => {
          const cols = Object.keys(fg).reduce((acc, field_name) => {
            if (!FIELDS_RESERVED.includes(field_name)) {
              acc[field_name] = generate_field(field_name, fg[field_name])
            }
            return acc
          }, {})

          // this is a bug in odoorpc.  'display_name' field is ok,
          if (!cols.display_name) {
            const field_data = { type: 'text', string: 'Name', readonly: true }
            const Field = generate_field('display_name', field_data)
            cols.display_name = Field
          }
          return cols
        }

        const cols = _get_cols_from_field_get(fields)

        this._columns = cols

        Object.keys(cols).forEach(item => {
          const Field = cols[item]
          Cls[`$${item}`] = Field
        })

        const _get_view_node2 = () => {
          const arch1 = view_info.arch
          // console.log('this._view_info 1', deep_copy(this._view_info))
          if (!arch1) {
            return {}
          }
          const node = xml2json.toJSON(arch1)
          // console.log('this._view_info arch11', arch1)
          // console.log('view_node 1', deep_copy(node))
          return this._get_view_node(node)
        }

        const view_node = _get_view_node2()

        // console.log('view_node env.....1,', view_node)

        this._view_node = view_node
        // this._view_node = this._get_view_node()
      }
    }

    const cls_name = model.replace('.', '_')

    // step 1: define a new model class, to set _env, _odoo, _name
    Object.defineProperty(Cls, 'name', { value: cls_name })
    Cls._reg_name = reg_name
    Cls._env = this
    Cls._odoo = this._odoo
    Cls._name = model

    // step 2: all columns from odoo call fields_get
    Cls._columns = {}

    Cls._view_type = view_type
    Cls._view_info = {}
    Cls._view_node = {}
    Cls._field_onchange = {}

    Cls._awaiters = []

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
      const _get_model_id = async () => {
        const model = Cls._name
        const dm = [['model', '=', model]]
        const model_ids = await this._odoo.execute('ir.model', 'search', dm)
        const model_id2 = model_ids.length ? model_ids[0] : 0
        return model_id2
      }
      const view_info = await _get_view_info()
      const model_id = await _get_model_id()
      console.log('view_info', view_info)
      view_info.model_id = model_id
      Cls._init_columns(view_info)
    }

    if (view_info) {
      Cls._init_columns(view_info, views)
    } else {
      // step 3: define a boolean flag, wait for class columns init finished
      const _cls_init_ok = _init_columns_async()
      Cls._awaiters.push(_cls_init_ok)
    }

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
