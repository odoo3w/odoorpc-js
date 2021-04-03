import { Model as BaseModel } from './models_base.js'

import xml2json from './xml2json.js'

const PAGE_SIZE = 10

const mixin_class = (...class_list) => {
  const list1 = class_list.filter(item => item).join(' ')
  const list2 = list1.split(' ')
  const list3 = Array.from(new Set(list2))
  return list3.join(' ')
}

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

  _view_node_default_html(node) {
    if (node.tagName === 'field') {
      return this._view_node_field(node)
    }
    if (node.tagName === 'label') {
      return this._view_node_label(node)
    }

    if (typeof node === 'string') {
      return node
    }

    return {
      name: node.tagName,
      meta: {
        readonly: this._view_readonly(node),
        invisible: this._view_invisible(node),
        required: this._view_required(node)
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

    if (node.attr.for) {
      const meta = this._columns[node.attr.for]
      string = meta.string
      if (meta.type === 'many2one') {
        value = meta.valueName(this)
      } else if (meta.type === 'selection') {
        value = meta.valueName(this)
      } else if (meta.type === 'one2many') {
        value = 'this o2m'
      } else if (meta.type === 'many2many') {
        value = 'this m2m'
      } else {
        value = meta.value(this)
      }
    } else {
      //
    }

    return {
      name: node.tagName,
      meta: {
        // readonly: this._view_readonly(node),
        // invisible: this._view_invisible(node),
        // required: this._view_required(node),
        value: value,
        string: string
      },
      tagName: node.tagName,
      attribute: {
        attrs: {
          ...get_attrs(node.attr)
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

  // ok
  _view_node_field(node) {
    const meta = this._columns[node.attr.name]
    let value = ''

    if (meta.type === 'many2one') {
      value = meta.valueName(this)
    } else if (meta.type === 'selection') {
      value = meta.valueName(this)
    } else if (meta.type === 'one2many') {
      value = 'this o2m'
    } else if (meta.type === 'many2many') {
      value = 'this m2m'
    } else {
      value = meta.value(this)
    }

    return {
      name: 'field',
      meta: {
        readonly: this._view_readonly(node),
        invisible: this._view_invisible(node),
        required: this._view_required(node),
        type: meta.type,
        string: meta.string,
        value: value,
        selection: meta.selection
      },
      tagName: node.tagName,
      attribute: {
        attrs: {
          // name
          // widget
          // options
          ...get_attrs(node.attr),
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
    const node = xml2json.toJSON(arch1)
    console.log('view_node 1', deep_copy(node))
    const node_form = this._view_node_default_html(node)

    const node_form2 = deep_copy(node_form)

    console.log('node_form', node_form2)

    return { ...node_form }
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

  // delllllll

  _view_node_notebook(node) {
    // const num = Math.ceil(Math.random() * 100)

    const children = node.children.map((item, index) => {
      return { index, page: item }
    })

    const tabChanged_callback = payload => {
      console.log(' tabChanged_callback', payload)
      this._currentNotebook = payload
    }

    return {
      attr: { class: mixin_class('o_notebook') },
      // children: [`${node.tagName}, ${node.attr.name},${node.attr.class} `],
      children: [
        {
          attr: { class: mixin_class('o_notebook_headers') },
          children: [
            {
              attr: { class: mixin_class('nav nav-tabs') },
              children: children.map(item => {
                return {
                  attr: {
                    class: mixin_class(
                      'nav-item',
                      this._view_class_common(item.page)
                    )
                  },
                  children: [
                    {
                      attr: {
                        class: mixin_class(
                          'nav-link',
                          ...(item.index === this._currentNotebook
                            ? ['active']
                            : [])
                        ),
                        attrs: {
                          'data-toggle': 'tab',
                          disable_anchor: true,
                          role: 'tab',
                          href: 'javascript:void(0)'
                        }
                      },
                      children: [item.page.attr.string],
                      tabChanged: {
                        callback: tabChanged_callback,
                        index: item.index
                      },

                      tagName: 'a'
                    }
                  ],
                  tagName: 'li'
                }
              }),
              tagName: 'ul'
            }
          ],
          tagName: 'div'
        },
        {
          attr: { class: mixin_class('tab_content') },

          children: children
            .filter(item => item.index === this._currentNotebook)
            .map(item => {
              return {
                attr: {
                  class: mixin_class(
                    'tab-pane',
                    ...(item.index === this._currentNotebook ? ['active'] : [])
                  ),
                  attrs: {
                    // id: `notebook_page_${item.index}`,
                  }
                },
                children: item.page.children.map(item2 =>
                  this._view_node_default_html(item2)
                ),
                tagName: 'div'
              }
            }),

          tagName: 'div'
        }
      ],
      tagName: 'div'
    }
  }

  _view_node_field_partner_autocomplete(node) {
    const meta = this._columns[node.attr.name]

    return {
      ...node,
      attr: {
        class: mixin_class(
          'o_field_partner_autocomplete o_field_widget',
          node.attr.class,
          this._view_class_common(node)
        ),
        attrs: get_attrs(node.attr)
        // { ...(node.attr.name ? { name: node.attr.name } : {}) },
      },
      children: [meta.value(this)],
      tagName: 'span'
    }
  }

  _view_node_field_radio(node) {
    const meta = this._columns[node.attr.name]

    const value =
      meta.type === 'selection' ? meta.valueName(this) : meta.value(this)

    return {
      ...node,
      attr: {
        class: mixin_class(
          'o_field_radio o_field_widget',
          node.attr.class,
          this._view_class_common(node)
        ),
        attrs: get_attrs(node.attr)
        // { ...(node.attr.name ? { name: node.attr.name } : {}) },
      },
      children: [value],
      tagName: 'span'
    }
  }

  _view_node_field_res_partner_many2one(node) {
    const meta = this._columns[node.attr.name]

    const value = meta.valueName(this)

    return {
      ...node,
      attr: {
        class: mixin_class(
          'o_field_uri o_field_widget',
          node.attr.class,
          this._view_class_common(node),
          'o_field_empty' // 这个 如何控制的
        ),
        attrs: get_attrs(node.attr)
      },
      children: [value],
      tagName: 'span'
    }
  }

  // ok
  _view_node_group_label(node) {
    if (node.tagName === 'field') {
      const label_class = mixin_class(
        'o_form_label',
        this._view_class_common(node)
      )

      // 这是  tip 用的
      // const attrs = { 'data-original-title': true, title: true }

      const meta = this._columns[node.attr.name]
      return {
        attr: { class: label_class },
        attrs: {
          // for 属性 是否有作用
          // for: ''
          // ...attrs,
        },
        children: [meta.string],
        tagName: 'label'
      }
    } else if (node.tagName === 'label') {
      return {
        attr: { class: 'o_form_label' },
        attrs: {
          // for 属性 是否有作用
          // for: ''
          // 这是  tip 用的
          // 'data-original-title': true,
          // title: true
        },
        children: [node.attr.string],
        tagName: 'label'
      }
    } else {
      return {
        attr: { class: mixin_class(this._view_class_common(node)) },
        attrs: get_attrs(node.attr),
        children: node.children,
        tagName: 'div'
      }
    }
  }

  // ok
  _view_node_group_table(fields, payload = {}) {
    //
    const { parent, col_count, style: value_style, class: class2 } = payload

    const get_table_matrix = (fields, col_count) => {
      // const matrix_col_count = col_count / 2
      const loop_res = fields.reduce(
        (acc, node) => {
          const { matrix, last_row, last_item } = acc

          let new_matrix = [...matrix]
          let new_row = last_row ? [...last_row] : []
          let new_item = last_item ? { ...last_item } : {}

          if (node.tagName === 'field') {
            if (node.attr.nolabel) {
              new_item = { ...new_item, value: node }
            } else {
              new_item = { label: node, value: node }
            }
          } else {
            new_item = { label: node }
          }

          if (new_item.label && new_item.value) {
            new_row = [...new_row, new_item]
            new_item = null
          }

          if (new_row.length === col_count / 2) {
            new_matrix = [...new_matrix, new_row]
            new_row = null
            new_item = null
          }

          acc = {
            matrix: new_matrix,
            last_row: new_row,
            last_item: new_item
          }
          return acc
        },
        { matrix: [], last_row: null, last_item: null }
      )

      const matrix = loop_res.matrix
      const part_matrix = loop_res.last_row ? [loop_res.last_row] : []
      return [...matrix, ...part_matrix]
    }

    const matrix = get_table_matrix(fields, col_count)

    // console.log('table_matrix, ', matrix)

    const node_table = {
      attr: { class: mixin_class('o_group', 'o_inner_group', class2) },
      children: [
        {
          children: matrix.map(row => {
            return {
              attr: {},
              children: row.reduce((acc, col) => {
                acc.push({
                  attr: { class: mixin_class('o_td_label') },
                  children: [this._view_node_group_label(col.label)],
                  tagName: 'td'
                })

                acc.push({
                  attr: { style: value_style },
                  children: [this._view_node_field(col.value)],
                  tagName: 'td'
                })

                return acc
              }, []),
              tagName: 'tr'
            }
          }),
          tagName: 'tbody'
        }
      ],
      tagName: 'table'
    }
    // console.log('node_table, ', node_table)

    return node_table
  }

  // ok
  _view_node_group_inner(node) {
    // console.log('inner group', node)

    const node_table = this._view_node_group_table(node.children, {
      parent: 'group_inner',
      col_count: 2,
      style: 'width: 100%',
      class: 'o_group_col_6'
    })
    // console.log('node_table, ', node_table)
    return node_table
  }

  // ok
  _view_node_group_outer(node) {
    return {
      ...node,
      attr: {
        class: mixin_class('o_group'),
        attrs: get_attrs(node.attr)
      },
      children: node.children.map(item => this._view_node_group_inner(item)),

      // children: [`${node.tagName}, ${node.attr.name},${node.attr.class} `],
      tagName: 'div'
    }
  }

  // ok
  _view_node_group_one(node) {
    console.log('inner group 1', node)
    // col: "4"
    const node_table = this._view_node_group_table(node.children, {
      parent: 'group_one',
      col_count: 4,
      style: 'width: 50%'
    })
    // console.log('node_table, ', node_table)
    return node_table
  }
  // ok
  _view_node_group(node) {
    const check_type = () => {
      if (!node.children) {
        return 0
      }
      if (node.children.length !== 2) {
        return 1
      }
      const child0 = node.children[0]
      const child1 = node.children[0]

      if (child0.tagName === 'group' && child1.tagName === 'group') {
        return 2
      } else {
        return 1
      }
    }

    const my_type = check_type()

    if (my_type === 1) {
      return this._view_node_group_one(node)
    } else if (my_type === 2) {
      return this._view_node_group_outer(node)
    } else {
      // return this._view_node_default(node)
    }
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
          }
        }
      }
    }

    return obj
  }
}
