export default {
  name: 'ONode',
  components: {
    OWidgetField: () => import('@/components/OWidgetField'),
    OButton: () => import('@/components/OButton'),
    OGroup: () => import('@/components/OGroup')
  },

  mixins: [],
  props: {
    editable: { type: Boolean, default: undefined },
    record: {
      type: Object,
      default: () => {
        return {}
      }
    },
    parent: {
      type: [Object, String], // 子元素 可能是文本字符串 或者 node
      default: undefined
    },
    node: {
      type: [Object, String], // 子元素 可能是文本字符串 或者 node
      default: () => {
        return { children: [] }
      }
    }
  },

  computed: {},

  render(createElement) {
    // const node = this.node
    return this.renderNode(createElement)
  },

  methods: {
    className(node) {
      const classList = [
        ...(node.attribute.class ? node.attribute.class.split(' ') : [])
      ]
      const meta = node.meta || {}
      if (meta.invisible) {
        classList.push('o_invisible_modifier')
      }
      if (meta.readonly) {
        classList.push('o_readonly_modifier')
      }
      if (meta.required) {
        classList.push('o_required_modifier')
      }
      return classList.join(' ')
    },

    renderNode(createElement) {
      const parent = this.parent
      const record = this.record
      const node = this.node
      const editable = this.editable
      // const deep_copy = node => {
      //   return JSON.parse(JSON.stringify(node))
      // }
      // console.log('ONode, xxxxxx:', node.tagName, deep_copy(node))
      // console.log('ONode, xxxxxx:', this.editable)
      // console.log('ONode, xxxxxx:', this.record)

      // console.log(' me,  parent node,', deep_copy(node), parent)

      if (!node) {
        console.log('error:  parent node,', parent)
        throw 'error node'
      }
      if (typeof node === 'string') {
        // 单字符串 做节点, 只能加上一个  span, 如果要去掉 span, 只能在上一级, 处理掉
        return createElement('span', {}, [node])
      }

      if (node.tagName === 'group') {
        return createElement('OGroup', {
          props: { record, parent, node, editable }
        })
      }

      if (node.tagName === 'field') {
        return createElement('OWidgetField', {
          props: { record, parent, node, editable }
        })
      }

      if (node.tagName === 'button') {
        return createElement('OButton', {
          props: { record, parent, node, editable }
        })
      }

      let tagName = node.tagName

      if (node.tagName === 'notebook') {
        tagName = 'div'
      } else if (node.tagName === 'page') {
        tagName = 'div'
      } else if (node.tagName === 'separator') {
        tagName = 'div'
      } else if (node.tagName === 'header') {
        tagName = 'div'
      }

      const children = (node.children || []).map(sub_node => {
        return createElement('ONode', {
          props: { record, parent: node, node: sub_node, editable }
        })
      })

      return createElement(
        tagName,
        {
          ...node.attribute,
          class: this.className(node),
          props: { record, node, editable }
        },
        children
      )
    }
  }
}
