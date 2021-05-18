import { View } from './view'

export class Action {
  constructor(env, payload) {
    const { model, fields, views } = payload
    const { action_data, action_xml_id, action_id } = payload
    // console.log('action data:', action_data)
    const { parent_view, parent_field } = payload

    this._env = env
    this._odoo = env._odoo
    this._data = action_data
    this._fields = fields
    this._views = views
    this._views_registry = {}
    this._model = model

    this._action_xml_id = action_xml_id
    this._action_id = action_id

    this._parent_view = parent_view
    this._parent_field = parent_field
  }

  static load_sync(env, payload = {}) {
    const { view, field } = payload
    const parent_xml_id = view._action
      ? view._action._action_xml_id
      : `model,${view.Model._name}`
    const view_type = view._view_type
    const xml_id = `${parent_xml_id},${view_type}.${field}`

    if (this._registry[xml_id]) {
      return this._registry[xml_id]
    }

    const action = this._load_sync(env, { ...payload, xml_id })
    this._registry[action._action_xml_id] = action
    this._registry[action._action_id] = action
    return action
  }

  static _load_sync(env, payload = {}) {
    const { view, field, xml_id } = payload
    const meta = view._columns[field]
    return new this(env, {
      model: meta.relation,
      views: meta.views,
      action_xml_id: xml_id,
      action_id: xml_id,
      parent_view: view,
      parent_field: field
    })
  }

  static async load(env, xml_id, additional_context = {}) {
    if (this._registry[xml_id]) {
      return this._registry[xml_id]
    }

    // 这是 异步 load, 参数是  action.xml_id or action.id
    const action = await this._load(env, xml_id, additional_context)
    this._registry[action._action_xml_id] = action
    this._registry[action._action_id] = action
    return action
  }

  static async _load_views(env, action_data) {
    const model = action_data.res_model
    const method = 'load_views'
    const views = action_data.views

    //  TBD  action_data.context is string 需要  eval_safe
    // const context = action_data.context
    // console.log(model, action_data.context)

    const context = {
      ...env.context,
      allowed_company_ids: env._odoo.allowed_company_ids
      // ...(action_data.context || {})
    }

    const result = await env._odoo.execute_kw(model, method, [], {
      views,
      context
    })
    // console.log(result)
    return result
  }

  static async _load(env, xml_id, additional_context = {}) {
    const is_call_ref =
      typeof xml_id === 'string' && xml_id.split('.').length === 2

    const action_id_to_call = is_call_ref ? (await env.ref(xml_id)).id : xml_id
    const action_data = await env._odoo.action_load(
      action_id_to_call,
      additional_context
    )

    const views_data = await this._load_views(env, action_data)
    const model = action_data.res_model
    const fields = views_data.fields
    const views = Object.keys(views_data.fields_views).reduce((acc, cur) => {
      const view_info = views_data.fields_views[cur]
      acc[view_info.type] = view_info
      return acc
    }, {})

    const action_xml_id = action_data.xml_id
    const action_id = action_data.id
    const payload1 = { model, fields, views }
    const payload2 = { action_data, action_xml_id, action_id }
    const payload = { ...payload1, ...payload2 }
    console.log(payload)

    const action = new this(env, payload)
    return action
  }

  get_view(view_type) {
    if (!this._views_registry[view_type]) {
      this._views_registry[view_type] = this._create_view(view_type)
    }
    return this._views_registry[view_type]
  }

  _create_view(view_type) {
    const model = this._model
    const view_info = this._views[view_type] || {
      fields: { display_name: { type: 'char', string: 'Name', readonly: true } }
    }

    const fields = { ...view_info.fields }
    const Model = this._env._model({ model, fields })
    return new View(this._env, { view_info, view_type, Model, action: this })
  }

  view_node(view_type) {
    console.log('view_node', view_type)
    return this.views[view_type]._view_node
  }

  async search_browse() {
    // console.log('search_read ', this, this.data.search_view)

    // domain 取自 context: "{'search_default_my_quotation': 1}"
    // search_view 中的 my_quotation
    const domain = []
    const context = {
      ...this._env.context,
      allowed_company_ids: this._odoo.allowed_company_ids
    }

    const view = this.get_view('tree')
    return view.search_browse({ domain, context })
  }

  async browse(ids) {
    // console.log('browse ', this, this.data.search_view)
    const view_type = Array.isArray(ids) ? 'tree' : 'form'
    const view = this.get_view(view_type)
    return view.browse(ids)
  }

  // 登陆时 读取所有的  models_id, 因此 该函数不再用了

  static async _get_model_ids(env, action_data, views_data) {
    const get_all_models = (views = {}) => {
      //   console.log(views)
      const result = {}
      Object.keys(views).forEach(item => {
        const fields = views[item].fields
        Object.keys(fields).forEach(fld => {
          const fg = fields[fld]
          if (fg.relation) {
            result[fg.relation] = 1
          }
          const result2 = get_all_models(fg.views)
          Object.keys(result2).forEach(model => {
            result[model] = (result[model] || 0) + result2[model]
          })
        })
      })
      return result
    }

    const models = get_all_models(views_data.fields_views)

    console.log(views_data, models)

    // const models2 = Object.keys(views_data.fields_views).reduce((acc, cur) => {
    //   const view_info = views_data.fields_views[cur]
    //   console.log(cur, view_info)

    //   const view_models =

    //   acc = {...acc, }

    //   return acc
    // }, {})

    models[action_data.res_model] = (models[action_data.res_model] || 0) + 1
    const domain = [['model', 'in', Object.keys(models)]]
    const model = 'ir.model'
    const method = 'search_read'
    const kwargs = { domain, fields: ['model'] }
    const model_ids = await env._odoo.execute_kw(model, method, [], kwargs)

    return model_ids.reduce((acc, cur) => {
      acc[cur.model] = cur.id
      return acc
    }, {})
  }

  // 登陆时 读取所有的  models_id, 因此 该函数不再用了

  static _get_views(views_data, model_ids) {
    const views = Object.keys(views_data.fields_views).reduce((acc, cur) => {
      const view_info = views_data.fields_views[cur]
      acc[view_info.type] = view_info
      return acc
    }, {})

    const _get_new_views = (views = {}) => {
      return Object.keys(views).reduce((acc, view_type) => {
        const view2 = views[view_type]
        const fields2 = view2.fields
        const fields = Object.keys(fields2).reduce((acc2, fld) => {
          const meta = fields2[fld]
          acc2[fld] = {
            ...meta,
            ...(meta.relation
              ? { relation_model_id: model_ids[meta.relation] }
              : {}),
            views: _get_new_views(meta.views)
          }
          return acc2
        }, {})

        acc[view_type] = { ...view2, fields }

        return acc
      }, {})
    }

    const views2 = _get_new_views(views)

    // console.log('views2', views2)

    return views2
  }
}

Action._registry = {}
