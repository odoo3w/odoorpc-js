import { Model as BaseModel } from './models_base.js'

import xml2json from './xml2json.js'

const PAGE_SIZE = 10

const mixin_class = (...class_list) => {
  const list1 = class_list.filter((item) => item).join(' ')
  const list2 = list1.split(' ')
  const list3 = Array.from(new Set(list2))
  return list3.join(' ')
}

export class Model extends BaseModel {
  constructor() {
    super()
    this._totalIds = []
    this._pageSize = PAGE_SIZE
    this._currentPage = 0
  }

  static get metadata() {
    return {
      description: 'used for web model to config. override by child Class',
    }
  }

  get metadata() {
    return this.constructor.metadata
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

  view_node(xml_node) {
    return xml2json.toJSON(xml_node)
  }

  view_info() {
    const arch1 = this._view_info.arch
    const arch = xml2json.toJSON(arch1)
    console.log(' get v view_info', arch)

    return this._view_info
    // const arch = xml2json.toJSON(arch1)
    // const header_node = arch.children[0]
    // const header = this.form_view_header(header_node)
    // const sheet_node = arch.children[1]
    // const sheet = this.form_view_sheet(sheet_node)

    // // console.log(' get v button_boxs2', button_boxs)

    // return {
    //   form: { ...arch.attr },
    //   header,
    //   sheet,
    // }
  }

  view_xml2html(payload = {}) {
    //
    // const view_info = this._view_info
    const arch1 = this._view_info.arch

    const node = xml2json.toJSON(arch1)
    console.log('view_info 1', node)

    const node2 = this._view_node_form(node, payload)

    console.log('view_info 2', node2)

    return node2
  }

  //
  _view_node_form(node, kwargs = {}) {
    const { readonly = true } = kwargs

    const node_sheet_bg = this._view_node_sheet_bg(node)
    const node_chatter = this._view_node_chatter(node)

    const class_list = ['o_form_view', node.attr.class]
    if (readonly) {
      class_list.push('o_form_readonly')
    }

    const node_form = {
      attr: {
        class: mixin_class(...class_list),
      },
      children: [node_sheet_bg, node_chatter],
      hasAttr: true,
      isParent: true,
      tagName: 'div',
    }

    return node_form
  }

  _view_node_chatter(node) {
    const node_chatter2 = node.children.filter(
      (item) => item.attr.class === 'oe_chatter'
    )

    if (node_chatter2.length === 0) {
      return null
    }

    const node_chatter = node_chatter2[0]

    return {
      ...node_chatter,
      attr: {
        ...node_chatter.attr,
        class: mixin_class('o_chatter', node_chatter.attr.class),
      },
      children: ['this chater', 'ok'],
      tagName: 'aside',
    }
  }

  _view_required(node) {
    if (!node.attr.modifiers) {
      return null
    }
    const modifiers = JSON.parse(node.attr.modifiers)
    if (modifiers.required !== undefined) {
      return modifiers.required
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
      return modifiers.readonly
    } else {
      return null
    }
  }

  _view_invisible(node) {
    if (node.attr.invisible) {
      return node.attr.invisible
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

  // ok
  _view_class_common(node) {
    const class_list = []
    const invisible = this._view_invisible(node)
    if (invisible) {
      class_list.push('o_invisible_modifier')
    }

    const readonly = this._view_readonly(node)
    if (readonly) {
      class_list.push('o_readonly_modifier')
    }

    const required = this._view_required(node)
    if (required) {
      class_list.push('o_required_modifier')
    }

    return class_list.join(' ')
  }

  // ok
  _view_node_button(node, kwargs = {}) {
    const class_list = node.attr.class ? node.attr.class.split(' ') : []

    const { parent = [] } = kwargs

    if (parent.includes('header')) {
      const oe_highlight =
        class_list.includes('oe_highlight') ||
        class_list.includes('btn-primary')
          ? 'btn-primary'
          : 'btn-secondary'

      class_list.push(oe_highlight)
    }
    const class_list2 = class_list.filter((item) => item !== 'oe_highlight')

    const children = []

    if (parent.includes('button_box')) {
      const icon = {
        attr: {
          class: mixin_class('fa fa-fw o_button_icon', node.attr.class),
        },
        tagName: 'i',
      }
      children.push(icon)

      node.children.forEach((item) => {
        if (item.tagName === 'field') {
          children.push(this._view_node_field(item))
        } else {
          children.push(item)
        }
      })
    }

    return {
      ...node,
      attr: {
        class: mixin_class(
          'btn',
          ...class_list2,
          this._view_class_common(node)
        ),
        attrs: {
          // ...node.attr,
          ...(node.attr.name ? { name: node.attr.name } : {}),
          type: 'button',
        },
      },

      onClick: Object.keys(node.attr).reduce((acc, cur) => {
        if (!['class', 'attrs', 'modifiers', 'invisible'].includes(cur)) {
          acc[cur] = node.attr[cur]
        }
        return acc
      }, {}),

      children: children.length ? children : [node.attr.string],
      tagName: 'button',
    }
  }

  _view_node_field(node) {
    if (node.attr.widget === 'statusbar') {
      return this._view_node_field_widget_statusbar(node)
    }

    const class_list = node.attr.class ? node.attr.class.split(' ') : []
    const meta = this._columns[node.attr.name]
    class_list.push(`o_field_${meta.type}`)
    class_list.push('o_field_widget')

    const children = []
    if (node.attr.widget === 'statinfo') {
      const node_value = {
        attr: { class: 'o_stat_value' },
        children: [meta.value(this)],
        tagName: 'div',
      }
      const node_text = {
        attr: { class: 'o_stat_text' },
        children: [node.attr.string],
        tagName: 'div',
      }
      children.push(node_value)
      children.push(node_text)
    }

    return {
      ...node,
      attr: {
        class: mixin_class(...class_list, this._view_class_common(node)),
        attrs: {
          ...(node.attr.name ? { name: node.attr.name } : {}),
        },
      },
      children,

      tagName: 'div',
    }
  }

  // ok
  _view_node_field_widget_statusbar(node) {
    const meta = this._columns[node.attr.name]
    const selection_dict = meta.selection.reduce((acc, cur) => {
      acc[cur[0]] = cur[1]
      return acc
    }, {})

    const states = node.attr.statusbar_visible.split(',')
    const children = states.reverse().map((state) => {
      return {
        attr: {
          class: mixin_class(
            'btn o_arrow_button',
            this.$state === state ? 'btn-primary' : 'btn-secondary',
            'disabled'
          ),

          attrs: {
            type: 'button',
            'data-value': state,
            disabled: 'disabled',
            title: this.$state === state ? '当前状态' : '非启用状态',
            'aria-pressed': false,
          },
        },
        children: [selection_dict[state]],

        tagName: 'button',
      }
    })

    const class_list = node.attr.class ? node.attr.class.split(' ') : []
    class_list.push('o_statusbar_status')
    class_list.push('o_field_widget')

    return {
      ...node,
      attr: {
        class: mixin_class(...class_list, this._view_class_common(node)),
        attrs: {
          ...node.attr,
        },
      },
      children,
      tagName: 'div',
    }
  }

  // ok
  _view_node_header(node) {
    const nodes = node.children.filter((item) => item.tagName === 'header')
    if (nodes.length === 0) {
      return null
    }

    const node2 = nodes[0]
    const statusbar_buttons = {
      attr: { class: 'o_statusbar_buttons' },
      children: node2.children
        .filter((item) => item.tagName === 'button')
        .map((item) => this._view_node_button(item, { parent: ['header'] })),
      hasAttr: true,
      isParent: true,
      tagName: 'div',
    }

    const children = node2.children
      .filter((item) => item.tagName === 'field')
      .map((item) => this._view_node_field(item))

    return {
      ...node2,
      attr: {
        class: mixin_class('o_form_statusbar', node2.attr.class),
        attrs: {
          ...node2.attr,
        },
      },
      children: [statusbar_buttons, ...children],
      tagName: 'div',
    }
  }

  _view_node_default(node) {
    return {
      ...node,
      attr: {
        class: mixin_class(node.attr.class),
        attrs: { ...node.attr },
      },
      children: [`${node.tagName}, ${node.attr.name},${node.attr.class} `],
      tagName: 'div',
    }
  }

  _view_node_button_box(node) {
    const children = node.children.map((item) => {
      if (item.tagName === 'button') {
        return this._view_node_button(item, { parent: ['button_box'] })
      } else if (item.tagName === 'field') {
        return this._view_node_field(item)
      } else {
        return this._view_node_default(item)
      }
    })
    return {
      ...node,
      attr: {
        class: mixin_class('o_not_full', node.attr.class),
        attrs: { ...node.attr },
      },
      children: children,
      // [`${node.tagName}, ${node.attr.name},${node.attr.class} `],
      tagName: 'div',
    }
  }

  _view_node_sheet(node) {
    const nodes = node.children.filter((item) => item.tagName === 'sheet')
    if (nodes.length === 0) {
      return null
    }

    const node2 = nodes[0]

    const children = node2.children.map((item) => {
      if (item.tagName === 'notebook') {
        return this._view_node_default(item)
      } else if (item.tagName === 'group') {
        return this._view_node_default(item)
      } else if (item.attr.name === 'button_box') {
        return this._view_node_button_box(item)
      } else if (item.attr.class === 'oe_title') {
        return this._view_node_default(item)
      } else {
        return this._view_node_default(item)
      }
    })

    return {
      ...node2,
      attr: {
        class: mixin_class(
          'clearfix position-relative o_form_sheet',
          node2.attr.class
        ),
        attrs: {
          ...node2.attr,
        },
      },
      children: children,
      // [statusbar_buttons, ...children],
      tagName: 'div',
    }

    // return null

    // const node_chatter = node_chatter2[0]

    // return {
    //   ...node_chatter,
    //   attr: {
    //     class: mixin_class('o_chatter', node_chatter.attr.class),
    //     attrs: {
    //       ...node_chatter.attr,
    //     },
    //   },
    //   children: ['this chater', 'ok'],
    //   tagName: 'aside',
    // }

    // 如果下一级是 group
    // 那么一定是 两个 inner group
    // 分为 4 col, 4 * 6 = 24
    // label 6, field 6, label 6, field 6
    // 1st, Group1 label, field or lable
    // 2nd, Group1 field, field or other
    // 3rd, Group2 label
    // 4th, Group2 field
    // 此时应该做循环处理
    // 这样直接 处理所有 到底
    // 内部 group 这样设置
    // classNames.push('o_group')
    // classNames.push('o_inner_group')
    // classNames.push('o_group_col_6')
    // 第三层的 label:
    // classNames.push('o_form_label')
    // 第三层的 field:
    // classNames.push('o_field_widget')
    // classNames.push('o_field_[field_type]')
  }

  // ok
  _view_node_sheet_bg(node) {
    const node_header = this._view_node_header(node)
    const node_sheet = this._view_node_sheet(node)

    const children = []
    // if (node_header) {
    //   children.push(node_header)
    // }
    if (node_sheet) {
      children.push(node_sheet)
    }

    const node_sheet_bg = {
      attr: { class: 'o_form_sheet_bg' },
      children,
      hasAttr: true,
      isParent: true,
      tagName: 'div',
    }

    return node_sheet_bg
  }

  //
  //

  static async form_view_get(view_id_or_xml_id) {
    const view_info = await super.fields_view_get(view_id_or_xml_id)
    const arch = xml2json.toJSON(view_info.arch)
    console.log(view_info)
    console.log(arch)
    return { ...view_info, arch }
  }

  static async tree_view_get(view_id_or_xml_id) {
    const view_info = await super.fields_view_get(view_id_or_xml_id)
    const arch = xml2json.toJSON(view_info.arch)
    console.log(view_info)
    console.log(arch)
    return { ...view_info, arch }
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
    const NOT = (v1) => {
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

    const compute_condition = (condition) => {
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

  // 不再用了
  // toArray() {
  //   console.log('to arr')
  //   return this.ids.map(id_ => {
  //     return this._toObject(id_)
  //   })
  // }

  // toObject() {
  //   const id_ = this.id
  //   return this._toObject(id_)
  // }

  // _toObject(id_) {
  //   return Object.keys(this._columns).reduce(
  //     (acc, col) => {
  //       const meta = this._columns[col]
  //       const one = this.getById(id_)
  //       const val = meta.value(one)
  //       acc[col] = val
  //       if (meta.type === 'many2one') {
  //         acc[`${col}__name`] = meta.valueName(one)
  //       } else if (meta.type === 'selection') {
  //         // console.log(meta.selection)
  //         acc[`${col}__name`] = meta.valueName(one)
  //       }
  //       return acc
  //     },
  //     { id: id_ }
  //   )
  // }

  get_readonlys() {
    const readonlys = {}
    for (const field_name in this._columns) {
      const meta = this._columns[field_name]
      readonlys[field_name] = meta._get_readonly(this)
    }
    return readonlys
  }

  // event_onchange(field) {
  //   console.log('event_onchange', field)
  //   if (this._callback_onchange) {
  //     // this.toObject()
  //     this._callback_onchange(this.toObject())
  //   }
  // }

  // onchange(callback) {
  //   this._callback_onchange = callback
  // }
  //

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
          },
        }
      },
    }

    return obj
  }
}
