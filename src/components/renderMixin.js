export default {
  // name: 'ORender',
  // props: {},

  components: {
    WidgetField: () => import('@/components/WidgetField.js'),
    OButton: () => import('@/components/OButton.vue'),
  },

  data() {
    return {
      is_title: 0,
      list: [],
    }
  },

  methods: {
    className(node) {
      const classList = [
        ...(node.attribute.class ? node.attribute.class.split(' ') : []),
      ]
      if (node.meta.invisible) {
        classList.push('o_invisible_modifier')
      }
      if (node.meta.readonly) {
        classList.push('o_readonly_modifier')
      }
      if (node.meta.required) {
        classList.push('o_required_modifier')
      }
      return classList.join(' ')
    },

    renderNode(createElement, node, parent) {
      if (!node) {
        console.log('error:  parent node,', parent)
        throw 'error node'
      }
      if (typeof node === 'string') {
        return node
      }

      let tagName = node.tagName

      if (node.tagName === 'field') {
        tagName = 'WidgetField'
      } else if (node.tagName === 'button') {
        tagName = 'OButton'
      } else if (node.tagName === 'group') {
        tagName = 'div'
      } else if (node.tagName === 'notebook') {
        tagName = 'div'
      } else if (node.tagName === 'page') {
        tagName = 'div'
      } else if (node.tagName === 'separator') {
        tagName = 'div'
      } else if (node.tagName === 'header') {
        tagName = 'div'
      }

      const children = (node.children || []).map((sub_node) => {
        return this.renderNode(createElement, sub_node, node)
      })

      if (['WidgetField', 'OButton'].includes(tagName)) {
        return createElement(
          tagName,
          { props: { node: node }, class: node.attribute.class },
          children
        )
      } else {
        const attribute = {}
        if (node.attribute.attrs && Object.keys(node.attribute.attrs).length) {
          attribute.attrs = { ...node.attribute.attrs }
        }
        if (this.className(node)) {
          attribute.class = this.className(node)
        }
        return createElement(tagName, { ...attribute }, children)
      }
    },
  },
}