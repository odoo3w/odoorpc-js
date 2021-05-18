import xml2json from './xml2json.js'

// eslint-disable-next-line no-unused-vars
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

const _onchange_spec = view_info => {
  // call by env _init_columns fields_view_get
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

class ViewBase {
  constructor(env, payload = {}) {
    const { view_info, view_type, Model, action } = payload

    this._env = env
    this._odoo = env._odoo
    this._action = action

    this._view_info = view_info
    this._view_type = view_type

    const fields = { ...view_info.fields }
    delete fields.id
    this._fields = fields

    this._Model = Model

    this._columns = {}
    this._field_onchange = {}
    this._view_node = {}

    this._parent_field = action ? action._parent_field : undefined
    this._parent_view = action ? action._parent_view : undefined

    this.init()
  }

  init() {
    const view_info = this._view_info
    this._field_onchange = _onchange_spec(view_info)

    this._columns = Object.keys(this._fields).reduce((acc, cur) => {
      acc[cur] = this._Model._columns[cur]
      return acc
    }, {})

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
    this._view_node = view_node
  }

  static async view_get(env, payload = {}) {
    const { view_type, view_ref, Model } = payload
    const view_info = await Model.fields_view_get({ view_type, view_ref })
    Model._update_sync(view_info.fields)
    return new this(env, { view_info, view_type, Model })
  }

  get Model() {
    return this._Model
  }

  get fields() {
    return this._fields
  }

  get view_node() {
    return this._view_node
  }

  _get_view_node(node) {
    const node_form = this._view_node_default_html(node)

    // const node_form2 = deep_copy(node_form)
    // console.log('node_form', node_form2)

    return { ...node_form }
  }

  _view_node_default_html(node) {
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
        children: node3.children.map(item => this._view_node_default_html(item))
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

  _view_node_label(node) {
    let string = ''
    if (node.attrs.for) {
      const meta = this._Model._columns[node.attrs.for]
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

  _view_node_field(node) {
    const meta = this._Model._columns[node.attrs.name]
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

  _get_templates(node) {
    // parent_view: view,
    // parent_field: field

    const parent_view = this._parent_view
    const parent_field = this._parent_field

    const get_tmpl = () => {
      if (parent_view && parent_field) {
        const parent_Model = parent_view._Model
        return (
          parent_Model.get_templates &&
          parent_Model.get_templates(node, parent_field)
        )
      }
      return this.Model.get_templates && this.Model.get_templates(node)
    }

    const tmpl = get_tmpl()
    if (tmpl) {
      return xml2json.toJSON(tmpl)
    } else {
      return node
    }
  }

  async browse(ids, payload = {}) {
    // console.log('browse ', this, )
    const fields = Object.keys(this.fields)
    return this.Model.browse(ids, { ...payload, fields, view: this })
  }
}

const PAGE_SIZE = 10

export class View extends ViewBase {
  constructor(env, payload = {}) {
    super(env, payload)

    this.domain = []
    this.order = ''
    this.offset = 0
    this.limit = PAGE_SIZE
    this.total_length = 0
  }

  get page_count() {
    return Math.ceil(this.total_length / this.limit)
  }

  get page_current() {
    return this.offset / this.limit
  }

  set page_current(value) {
    this.offset = value * this.limit
  }

  async search_count() {
    return this._Model.search_count(this.domain)
  }

  async search_browse(payload = {}) {
    // console.log('search_browse ', this)
    // const { domain = [], offset = 0, limit = 0, order = '' } = payload
    const fields = Object.keys(this.fields)
    const payload2 = { ...payload, fields, view: this }
    const records = await this.Model.search_browse(payload2)
    return records
  }

  search_callback(result) {
    this.total_length = result.length
  }

  async pageFirst() {
    this.page_current = 0
    return this._page_browse()
  }

  async pageLast() {
    const page = this.page_count > 0 ? this.page_count - 1 : 0
    this.page_current = page
    return this._page_browse()
  }
  async pagePrev(/*step = 1*/) {
    const page = this.page_current
    if (page <= 0) {
      return this.pageLast()
    }

    this.page_current = page - 1
    return this._page_browse()
  }

  async pageNext(/*step = 1*/) {
    const page = this.page_current
    if (page + 1 >= this.page_count) {
      return this.pageFirst()
    }

    this.page_current = page + 1
    return this._page_browse()
  }

  async pageGoto(page) {
    if (page <= 0) {
      this.page_current = 0
    } else if (page >= this.page_count) {
      this.page_current = this.page_count - 1
    } else {
      this.page_current = page
    }

    return this._page_browse()
  }

  async _page_browse() {
    const domain = this.domain
    const limit = this.limit
    const order = this.order
    const offset = this.offset

    const payload = { domain, offset, limit, order }
    return await this.search_browse(payload)
  }
}
