import { Model as BaseModel } from './models_base.js'

// import xml2json from './xml2json.js'

// import QWEB from './qweb'

const PAGE_SIZE = 10

const eval_safe = (domain, globals_dict = {}, locals_dict = {}) => {
  const to_replaced = { '\\(': '[', '\\)': ']', False: 'false', True: 'true' }
  to_replaced['function'] = 'function2'

  let domain2 = domain
  Object.keys(to_replaced).forEach(item => {
    domain2 = domain2.replace(new RegExp(item, 'g'), to_replaced[item])
  })

  const kwargs = { ...globals_dict, ...locals_dict }

  const fn_str = []
  fn_str.push('() => {')
  Object.keys(kwargs).forEach(item => {
    const vals = kwargs[item]
    const is_str = typeof vals === 'string'
    const is_arr = Array.isArray(vals)
    const vals2 = is_str ? `'${vals}'` : is_arr ? `[${vals}]` : vals
    // console.log('fn eval 1:', item, vals, vals2)
    const item2 = item === 'function' ? 'function2' : item
    const str_to_push = `const ${item2} = ${vals2}`
    // console.log('fn eval 1:', item, vals, vals2, str_to_push)
    fn_str.push(str_to_push)
  })
  fn_str.push(`return ${domain2}`)
  fn_str.push('}')

  const fn_str2 = fn_str.join('\n')
  // console.log('fn eval:', fn_str2)
  const fn = eval(fn_str2)
  // console.log('fn eval fn::', fn)
  const ret = fn()
  // console.log(ret)

  return ret
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

  //

  view_node() {
    return this.constructor._view_node
  }

  //

  _view_required(node, dataDict) {
    if (!node.attrs.modifiers) {
      return null
    }
    const modifiers = JSON.parse(node.attrs.modifiers)
    if (modifiers.required !== undefined) {
      const required = this.compute_domain(modifiers.required, dataDict)
      return required
    } else {
      return null
    }
  }

  _view_readonly(node, dataDict) {
    if (!node.attrs.modifiers) {
      return null
    }

    const modifiers = JSON.parse(node.attrs.modifiers)

    if (modifiers.readonly !== undefined) {
      const readonly = this.compute_domain(modifiers.readonly, dataDict)

      return readonly
    } else {
      return null
    }
  }

  _view_invisible(node, dataDict) {
    if (node.attrs.invisible) {
      return node.attrs.invisible ? true : false
    }
    if (!node.attrs.modifiers) {
      return null
    }

    const modifiers = JSON.parse(node.attrs.modifiers)

    if (modifiers.invisible !== undefined) {
      const invisible = this.compute_domain(modifiers.invisible, dataDict)
      return invisible
    } else {
      return null
    }
  }

  _view_node_attrs_options(node) {
    const res = this._view_node_attrs_base(node.attrs, ['options'])
    return res.options
  }

  _view_node_attrs_context(node) {
    const res = this._view_node_attrs_base(node.attrs, ['context'])
    return res.context
  }

  _view_node_attrs_base(attrs, items) {
    // console.log('eval_safe_python1', attrs)
    // options: "{'no_open':True,'no_create': True}"
    // context: "{'default_is_company': True, 'show_vat': True}"
    // domain: "[('is_company', '=', True)]"

    // const ss = {
    //   default_parent_id: active_id,
    //   default_street: street,
    //   default_street2: street2,
    //   default_city: city,
    //   default_state_id: state_id,
    //   default_zip: zip,
    //   default_country_id: country_id,
    //   default_lang: lang,
    //   default_user_id: user_id,
    //   default_type: 'other'
    // }

    const result = items.reduce((acc, cur) => {
      const value = attrs[cur]
      if (value) {
        acc = {
          ...acc,
          [`${cur}_old`]: value,
          [cur]: this.eval_safe(value)
        }
      }
      return acc
    }, {})

    return result
  }

  async eval_safe(value_str) {
    /*
  // # 仅被 get_selection1 使用

  // # 在多公司时, 用户可能 用 allowed_company_ids 中的一个
  // # 允许 用户 在前端 自己在 allowed_company_ids 中 选择 默认的公司
  // # 该选择 需要 存储在 本地 config 中

  // #  全部 odoo 只有这4个 模型 在获取 fields_get时, 需要提供 globals_dict, 设置 domain
  // #  其余的只是需要 company_id
  // #  --- res.partner
  // #  <-str---> state_id [('country_id', '=?', country_id)]

  // #  --- sale.order.line
  // #  <-str---> product_uom [('category_id', '=', product_uom_category_id)]

  // #  --- purchase.order.line
  // #  <-str---> product_uom [('category_id', '=', product_uom_category_id)]

  // #  --- stock.move
  // #  <-str---> product_uom [('category_id', '=', product_uom_category_id)]
  */

    const _get_company_id = () => {
      const session_info = this._odoo.session_info
      // # company_id = session_info['company_id']
      const user_companies = session_info.user_companies
      const current_company = user_companies.current_company[0]
      // # allowed_companies = user_companies['allowed_companies']
      // # allowed_company_ids = [com[0] for com in allowed_companies]
      return current_company
    }

    const _get_values_for_domain = () => {
      // const globals_fields = Globals_Dict

      // console.log('globals_fields', instance.fetch_one1())
      // // console.log('globals_fields', instance.field_onchange)
      // const values2 = instance.fetch_one1()

      const globals_fields = Object.keys(this._columns)

      const values = globals_fields.reduce((acc, col) => {
        const meta = this._columns[col]
        if (meta) {
          // console.log('vsls', col, meta)
          acc[col] = meta.raw_value(this)
        }
        return acc
      }, {})
      if (!values.company_id) {
        values.company_id = _get_company_id()
      }
      return values
    }

    const _get_res_model_id = async () => {
      return this.get_model_id()
    }

    const domain = value_str || false

    if (domain && typeof domain === 'string') {
      const values = _get_values_for_domain()

      const globals_dict = {
        res_model_id: await _get_res_model_id(),
        allowed_company_ids: this._odoo.allowed_company_ids,
        ...values,
        active_id: this.id
      }

      const domain2 = eval_safe(domain, globals_dict)
      // console.log('domain2: ', domain2)
      return domain2
    } else {
      return domain
    }
  }

  compute_domain(domain_in, dataDict) {
    // const record = this.fetch_one()
    const record = dataDict || this.fetch_one()

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
