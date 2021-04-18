import { Model as BaseModel } from './models_base.js'

import xml2json from './xml2json.js'

// import QWEB from './qweb'

const PAGE_SIZE = 10

const get_attrs = node_attr => {
  return Object.keys(node_attr).reduce((acc, cur) => {
    if (!['class', 'attrs', 'modifiers', 'invisible'].includes(cur)) {
      acc[cur] = node_attr[cur]
    }
    return acc
  }, {})
}

const deep_copy = node => {
  return JSON.parse(JSON.stringify(node))
}

export class Model extends BaseModel {
  constructor() {
    super()
    this._totalIds = []
    this._pageSize = PAGE_SIZE
    this._currentPage = 0

    this._currentNotebook = 0
  }

  get totalIds() {
    return this._totalIds
  }

  get count() {
    return this._totalIds.length
  }

  get pageCount() {
    return Math.ceil(this.count / this.pageSize)
  }

  get currentPage() {
    return this._currentPage
  }

  get pageSize() {
    return this._pageSize
  }

  async pageGoto(page) {
    if (page >= 0 && page < this.pageCount) {
      this._currentPage = page
      return this._page_browse(page)
    } else {
      return this.pageFirst()
    }
  }

  async pageFirst() {
    const page = 0
    this._currentPage = page
    return this._page_browse(page)
  }

  async pageLast() {
    const page = this.pageCount
    this._currentPage = page - 1
    return this._page_browse(this._currentPage)
  }

  async pagePrev(/*step = 1*/) {
    const page = this._currentPage
    if (page > 0) {
      this._currentPage = page - 1
      return this._page_browse(this._currentPage)
    } else if (page < 0) {
      return this.pageLast()
    } else {
      return this.constructor.browse([])
    }
  }

  async pageNext(/*step = 1*/) {
    const page = this._currentPage
    if (this.pageCount > page + 1) {
      this._currentPage = page + 1
      return this._page_browse(this._currentPage)
    } else {
      return this.constructor.browse([])
    }
  }

  async _page_browse(page) {
    if (!this.pageCount || page < 0 || page >= this.pageCount) {
      return this.constructor.browse([])
    }

    const offset = this.pageSize * page
    const ids2 = this.totalIds.slice(offset, offset + this.pageSize)
    const one = await this.constructor.browse(ids2)
    one._totalIds = this.totalIds
    one._pageSize = this.pageSize
    one._currentPage = this._currentPage
    return one
  }

  // magic method for web
  static async pageSearch(domain = [], kwargs = {}) {
    const { order, pageSize = PAGE_SIZE } = kwargs
    const ids = await this.search(domain, { order })
    const all = await this.browse([])
    all._totalIds = ids
    all._pageSize = pageSize
    all._currentPage = -1
    return all
  }

  _view_required(node) {
    if (!node.attr.modifiers) {
      return null
    }
    const modifiers = JSON.parse(node.attr.modifiers)
    if (modifiers.required !== undefined) {
      const required = this.compute_domain(modifiers.required)
      return required
    } else {
      return null
    }
  }

  _view_readonly(node) {
    if (!node.attr.modifiers) {
      return null
    }

    const modifiers = JSON.parse(node.attr.modifiers)

    if (modifiers.readonly !== undefined) {
      const readonly = this.compute_domain(modifiers.readonly)

      return readonly
    } else {
      return null
    }
  }

  _view_invisible(node) {
    if (node.attr.invisible) {
      return node.attr.invisible ? true : false
    }
    if (!node.attr.modifiers) {
      return null
    }

    const modifiers = JSON.parse(node.attr.modifiers)

    if (modifiers.invisible !== undefined) {
      const invisible = this.compute_domain(modifiers.invisible)
      return invisible
    } else {
      return null
    }
  }

  _get_templates(node) {
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
  get_templates(node, field) {
    // console.log('get_templates', this._from_record)
    return null
  }

  _view_node_default_html(node) {
    // console.log(' _view_node_default_html', node)
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
      // console.log('is templates:', node)
      // const qweb = new QWEB(this)
      // const node2 = qweb.toNode(node)
      const node3 = this._get_templates(node)

      // console.log('temp, return:', node3)

      // const node2 = node

      return {
        ...node3,
        children: node3.children.map(item => this._view_node_default_html(item))
      }
    }

    return {
      name: node.tagName,
      meta: {
        readonly: this._view_readonly(node),
        invisible: this._view_invisible(node),
        required: this._view_required(node),
        string: node.attr.string
      },
      tagName: node.tagName,

      attribute: {
        attrs: { ...get_attrs(node.attr) },
        class: node.attr.class
      },

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
    let value = ''
    let valueName = ''
    let input_id = undefined

    if (node.attr.for) {
      const meta = this._columns[node.attr.for]
      string = node.attr.string || meta.string
      value = meta.value(this)
      valueName = meta.valueName(this)
      input_id = meta.getInputId(this)
    } else {
      //
    }

    return {
      name: node.tagName,
      meta: {
        readonly: 1,
        // readonly: this._view_readonly(node),
        // invisible: this._view_invisible(node),
        // required: this._view_required(node),
        value,
        valueName,
        string,
        input_id
      },
      tagName: node.tagName,
      attribute: {
        attrs: {
          ...get_attrs(node.attr),
          string
        },
        class: node.attr.class
      },
      children:
        !node.isParent && node.content
          ? [node.content]
          : (node.children || []).map(item =>
              this._view_node_default_html(item)
            )
    }
  }

  eval_safe_python(attr, items) {
    // console.log('eval_safe_python', attr)
    // options: "{'no_open':True,'no_create': True}"
    // context: "{'default_is_company': True, 'show_vat': True}"
    // domain: "[('is_company', '=', True)]"
    const _eval_safe_python_one = value_str => {
      // const to_replaced = { False: 'false', True: 'true' }
      const to_replaced = {
        '\\(': '[',
        '\\)': ']',
        False: 'false',
        True: 'true'
      }

      let value_str2 = value_str
      Object.keys(to_replaced).forEach(item => {
        value_str2 = value_str2.replace(
          new RegExp(item, 'g'),
          to_replaced[item]
        )
      })

      const fn_str = []
      fn_str.push('() => {')
      fn_str.push(`return ${value_str2}`)
      fn_str.push('}')

      const fn_str2 = fn_str.join('\n')
      // console.log(fn_str2)
      const fn = eval(fn_str2)
      const ret = fn()
      // console.log(ret)

      return ret
    }

    // const items = ['options']

    const result = items.reduce((acc, cur) => {
      const value = attr[cur]
      if (value) {
        acc = {
          ...acc,
          [`${cur}_old`]: value,
          [cur]: _eval_safe_python_one(value)
        }
      }
      return acc
    }, {})

    return result
  }
  // ok
  _view_node_field(node) {
    const meta = this._columns[node.attr.name]

    const get_meta_data = () => {
      if (meta) {
        return {
          type: meta.type,
          string: meta.string,
          selection: meta.selection,
          value: meta.value(this),
          valueName: meta.valueName(this),
          input_id: meta.getInputId(this)
        }
      } else {
        return {
          type: '',
          string: '',
          selection: [],
          value: '',
          valueName: '',
          input_id: undefined
        }
      }
    }

    const meta_data = get_meta_data()

    return {
      name: 'field',
      meta: {
        readonly: this._view_readonly(node),
        invisible: this._view_invisible(node),
        required: this._view_required(node),
        ...meta_data,
        name: node.attr.name,
        string: node.attr.string || meta_data.string
      },
      tagName: node.tagName,
      attribute: {
        attrs: {
          // name
          // widget
          // options
          ...get_attrs(node.attr),
          // options_old: node.attr.options,
          ...this.eval_safe_python(node.attr, ['options']),

          // options: eval_safe_python(node.attr.options),

          can_create: node.attr.can_create
            ? JSON.parse(node.attr.can_create)
            : null,
          can_write: node.attr.can_write
            ? JSON.parse(node.attr.can_write)
            : null
        },
        class: node.attr.class
      }
    }
  }

  view_node() {
    const arch1 = this._view_info.arch
    // console.log('this._view_info 1', deep_copy(this._view_info))
    if (!arch1) {
      return {}
    }
    const node = xml2json.toJSON(arch1)
    // console.log('this._view_info arch11', arch1)
    // console.log('view_node 1', deep_copy(node))
    const node_form = this._view_node_default_html(node)

    // const node_form2 = deep_copy(node_form)

    // console.log('node_form', node_form2)

    return { ...node_form }
  }

  node_with_data(node_in, data) {
    const is_node = node => {
      if (typeof node !== 'object') {
        return false
      }
      if (Array.isArray(node)) {
        return false
      }
      if (typeof node === 'boolean') {
        return false
      }

      return true
    }

    const process = node => {
      const children = (node.children || []).map(item => process(item))
      if (!is_node) {
        return node
      }

      const node2 = {
        ...node,
        ...(children.length ? { children: children } : {})
      }

      if (node.tagName !== 'field') {
        return node2
      }

      const rec = this.getById(data.id)
      return {
        ...node2,
        meta: {
          ...node.meta,
          value: rec._columns[node.meta.name].value(rec),
          valueName: rec._columns[node.meta.name].valueName(rec)
        }
      }
    }

    const node2 = process(node_in)

    return node2
  }

  compute_domain(domain_in) {
    // console.log(domain_in, record)
    const record = this.fetch_one()
    return this.constructor.compute_domain(domain_in, record)
  }

  static compute_domain(domain_in, record, debug) {
    if (!Array.isArray(domain_in)) {
      return domain_in
    }
    const domain = [...domain_in]

    const AND = (v1, v2) => {
      // console.log('AND', v1, v2)
      if (debug) {
        return v1 * v2
      } else {
        const val1 = compute_condition(v1)
        const val2 = compute_condition(v2)

        return val1 && val2
      }
    }
    const OR = (v1, v2) => {
      // console.log('OR', v1, v2)
      if (debug) {
        return v1 + v2
      } else {
        const val1 = compute_condition(v1)
        const val2 = compute_condition(v2)
        return val1 || val2
      }
    }
    const NOT = v1 => {
      // console.log('NOT', v1)
      if (debug) {
        return -v1
      } else {
        return !v1
      }
    }

    const OPTIONS = { '&': AND, '|': OR, '!': NOT }

    // let index = 0

    const EQU = (val1, val2) => {
      // console.log('EQU', val1, ',', val2)

      if (!Array.isArray(val1)) {
        return val1 === val2
      }

      if (val1.length === 0 && val2.length === 0) {
        return true
      } else if (val1.length !== val2.length) {
        return false
      }
      //
      throw 'TBD: EQU, array'
    }

    const IN = (val1, val2) => {
      // console.log('IN', val1, ',', val2)
      const ret = val2.includes(val1)
      // console.log('IN', ret)
      return ret
    }

    const compute_condition = condition => {
      if (!Array.isArray(condition)) {
        return condition
      }
      //
      const [field, op, val] = condition
      // console.log('xxxx', field, record[field], op, val)
      const val1 = record[field]
      switch (op) {
        case '=':
        case '==':
          return EQU(val1, val)
        case '!=':
        case '<>':
          // if(field===''){
          //   //
          // }

          return !EQU(val1, val)
        case '<':
          return val1 < val
        case '>':
          return val1 > val
        case '<=':
          return val1 <= val
        case '>=':
          return val1 >= val
        case 'in':
          return IN(val1, val)
        case 'not in':
          return !IN(val1, val)
        // case 'like':
        // // return (fieldValue.toLowerCase().indexOf(this._data[2].toLowerCase()) >= 0);
        // case '=like':
        // // var regExp = new RegExp(this._data[2].toLowerCase().replace(/([.\[\]\{\}\+\*])/g, '\\\$1').replace(/%/g, '.*'));
        // // return regExp.test(fieldValue.toLowerCase());
        // case 'ilike':
        // // return (fieldValue.indexOf(this._data[2]) >= 0);
        // case '=ilike':
        // return new RegExp(this._data[2].replace(/%/g, '.*'), 'i').test(fieldValue);
        default:
          throw 'error'
        // throw new Error(_.str.sprintf(
        //     "Domain %s uses an unsupported operator",
        //     this._data
        // ));
        //
      }
    }

    const fn = (domain, op) => {
      // console.log('1st:index:', index, domain, op)
      // index = index + 1
      if (!domain.length) {
        return [null]
      } else if (op.length === 0 && domain.length === 1) {
        const val = domain[0]
        const val2 = compute_condition(val)
        return [val2]
        // return domain
        // const val = domain[0]
        // if (val === true || val === false) {
        //   console.log('all ret,', domain)
        //   return domain
        // }
      }

      const one = domain.shift()
      if (['&', '|', '!'].includes(one)) {
        // console.log('2.1, &|!:', domain, op, one)
        op.push(one)
        const ret = fn(domain, op)
        // console.log('2.1,&|!,1:', domain, op)
        // console.log('2.1,&|!,ok:', ret)
        return ret
      } else {
        // console.log('2.2:', domain, op, one)
        if (op.length === 0) {
          // op not(!&|)  and domain >1
          // console.log('4 default &', domain, op, one)
          op.push('&')
          op.push(one)
          // console.log('4 default & 1', domain, op)
          const dm2 = fn(domain, op)
          // console.log('4 default & ok', dm2, op)
          return dm2
          // return fn(dm2, op)
        } else {
          // console.log('3 comp:', domain, op, one)
          const comp = op[op.length - 1]
          if (comp === '!') {
            // console.log('3.1 !,:', domain, op, one)
            op.pop()
            const ret = NOT(one)
            // console.log('3.1 !,ok:', [ret, ...domain], op)
            return fn([ret, ...domain], op)
          } else if (comp === '&' || comp === '|') {
            op.push(one)
            return fn(domain, op)
          } else {
            // console.log('3.2 &|,:', domain, op, one)
            const v1 = op.pop()
            const c0 = op.pop()
            const ret = OPTIONS[c0](v1, one)
            // console.log('3.2 &|,ok:', [ret, ...domain], op)
            return fn([ret, ...domain], op)
          }
        }
      }
    }

    const ret = fn(domain, [])

    const ret2 = ret[0]

    // console.log('all,ok', ret2)

    return ret2
  }

  get_selection(field, payload) {
    // console.log('get_selection', field, payload)
    const meta = this._columns[field]
    return meta.get_selection(this, payload)
  }

  // 不再用了

  get_readonlys() {
    const readonlys = {}
    for (const field_name in this._columns) {
      const meta = this._columns[field_name]
      readonlys[field_name] = meta._get_readonly(this)
    }
    return readonlys
  }

  static async _bak_search_browse2(domain = [], kwargs = {}) {
    const { order, limit = 10 } = kwargs
    //
    const ids = await this.search(domain, { order })

    const that = this

    const obj = {
      ids,
      count: ids.length,
      self: that,

      [Symbol.iterator]: () => {
        //
        let index = 0
        return {
          next() {
            const offset = limit * index
            // console.log('in next', index, offset)
            if (ids.length > offset) {
              const ids2 = ids.slice(offset, offset + limit)
              // console.log('in next ids', ids2)
              const one = that.browse(ids2)
              index++
              return { value: one, done: false }
            } else {
              // console.log('in next done')
              return { value: undefined, done: true }
            }
          }
        }
      }
    }

    return obj
  }
}
