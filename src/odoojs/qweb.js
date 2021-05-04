let qcnt = 0

const qcounter = () => {
  qcnt = qcnt + 1
}

export default class QWEB {
  constructor(record) {
    this._record = record
    this._attr = {}
    this._params = {}

    console.log(' QWEB, record,', record.fetch_one())

    const record2 = record.fetch_one()
    const record3 = Object.keys(record2).reduce((acc, cur) => {
      const meta = record._columns[cur]
      if (!meta) {
        acc[cur] = { raw_value: record2[cur], value: record2[cur] }
      } else {
        acc[cur] = {
          raw_value:
            meta.type === 'binary' ? meta.raw_value(record) : record2[cur],
          value: meta.getValue(record)
        }
      }

      return acc
    }, {})

    this._params.record = record3

    // TBD 检查  qweb 用到了 哪些内容
    // 现在是 res.partner child_ids kanban 用到的
    // res.partner Kanban
    // sale.order Kanban

    this._params._s = record._odoo.baseURL

    this._params.kanban_color = color => {
      return 'oe_kanban_color_' + color
    }

    // eslint-disable-next-line no-unused-vars
    this._params.kanban_image = (model, field, rid, placeholder) => {
      return record2[field]
    }

    // TBD 检查  qweb 用到了 哪些内容
  }

  _getval(value_str) {
    qcounter()
    // console.log('_getval,', qcnt, value_str, this._params)

    const to_replaced = { ' and ': ' && ', ' or ': ' || ' }

    let value_str2 = value_str
    Object.keys(to_replaced).forEach(item => {
      value_str2 = value_str2.replace(new RegExp(item, 'g'), to_replaced[item])
    })

    const fn_str = []
    fn_str.push('() => {')
    Object.keys(this._params).forEach(item => {
      fn_str.push(`const ${item} = this._params.${item}`)
    })
    fn_str.push(`return ${value_str2}`)
    fn_str.push('}')

    const fn_str2 = fn_str.join('\n')
    // console.log('fn str:', fn_str2)
    const fn = eval(fn_str2)
    const value = fn()

    return value
  }

  _process_t_var(tattr) {
    qcounter()
    // console.log('_process_t_var,', qcnt, tattr)
    const getattr = att => tattr[`t-${att}`]

    const set_name = () => {
      const name = getattr('name')
      if (name) {
        this._attr.name = name
      }
    }

    const get_condition = () => {
      const t_if = getattr('if')
      if (t_if) {
        return { if: this._getval(t_if) }
      }
      const t_elif = getattr('elif')
      if (t_elif) {
        return { elif: this._getval(t_elif) }
      }
      const t_else = getattr('else')
      if (t_else !== undefined) {
        return { else: '' }
      }

      return {}
    }

    const get_other = () => {
      const not_includes = ['name', 'if', 'elif', 'else', 'set', 'value']
      return Object.keys(tattr || {})
        .filter(item => item.slice(0, 2) === 't-')
        .filter(item => item.slice(0, 6) !== 't-att-')
        .filter(item => item.slice(0, 7) !== 't-attf-')
        .filter(item => !not_includes.includes(item.slice(2, item.length)))
        .reduce((acc, cur) => {
          const att = cur.slice(2, cur.length)
          acc[att] = this._getval(tattr[cur])
          return acc
        }, {})
    }

    const set_params = () => {
      const set1 = getattr('set')
      if (set1) {
        const value = getattr('value')
        this._params[set1] = this._getval(value)
      }
    }

    const get_attr = () => {
      return Object.keys(tattr || {})
        .filter(item => item.slice(0, 6) === 't-att-')
        .reduce((acc, cur) => {
          //
          const att = cur.slice(6, cur.length)
          acc[att] = this._getval(tattr[cur])
          return acc
        }, {})
    }

    const get_attf = () => {
      return Object.keys(tattr || {})
        .filter(item => item.slice(0, 7) === 't-attf-')
        .reduce((acc, cur) => {
          console.log('attf:', cur, tattr[cur])
          //
          const att = cur.slice(7, cur.length)
          const value = tattr[cur]
          acc[att] = value
          return acc
        }, {})
    }

    set_name()
    set_params()
    const t_attr = get_other()
    const condition = get_condition()
    const attr = get_attr()
    const attf = get_attf()
    const ret = { attr: { ...attr, ...attf }, condition, t_attr }
    return ret
  }

  // esc  t_attr
  _process_one(node, vars) {
    qcounter()
    // console.log('_process_one,', qcnt, node)
    const attr = vars.attr || {}
    const t_attr = vars.t_attr || {}

    if (node.tagName === 't') {
      if ('esc' in t_attr) {
        return [t_attr.esc]
      }
      if (node.children && node.children.length) {
        const children = this._process(node.children)
        return children
      }
      return []
    } else {
      const ret = { ...node, attr: { ...node.attr, ...attr } }
      let children = undefined
      if ('esc' in t_attr) {
        children = [t_attr.esc]
      } else if (node.children && node.children.length) {
        children = this._process(node.children)
      }
      if (children) {
        ret.children = children
      }
      return [ret]
    }
  }

  _process(nodes) {
    qcounter()
    // console.log('_process,', qcnt, nodes)

    const do_sth = (node, vars) => {
      return this._process_one(node, vars)
    }

    let result = []
    let next = undefined

    const nodes_loop = [...nodes]
    while (nodes_loop.length) {
      const node = nodes_loop.shift()

      // qcounter()
      // console.log('_process  while,', qcnt, node)

      if (node && typeof node === 'string') {
        result.push(node)
        continue
      }

      const vars = this._process_t_var(node.attr)
      // console.log('_process  while, vars,', qcnt, vars, this._params)
      const condition = vars.condition
      // console.log('_process  while, condition,', qcnt, condition)

      if (Object.keys(condition).length === 0) {
        result = [...result, ...do_sth(node, vars)]
        next = undefined
        continue
      } else if ('if' in condition) {
        if (condition.if) {
          next = 'ignore' // ingore all else
          result = [...result, ...do_sth(node, vars)]
          continue
        } else {
          next = 'check'
          continue
        }
      }
      //  elif or else in condition
      else if (!next) {
        continue
      } else if (next === 'ignore') {
        continue
      } else if ('elif' in condition) {
        if (condition.elif) {
          next = 'ignore' // ingore all else
          result = [...result, ...do_sth(node, vars)]
          continue
        } else {
          next = 'check'
          continue
        }
      } else {
        // else in condition
        result = [...result, ...do_sth(node, vars)]
        continue
      }
    }

    return result
  }

  toNode(tmpl_node) {
    qcounter()
    // console.log('toNode,', qcnt, tmpl_node)

    const children = this._process(tmpl_node.children)

    // console.log('toNode,this._params,', qcnt, this._params)

    return {
      attr: { ...this._attr },
      tagName: tmpl_node.tagName,
      children
    }
  }
}
