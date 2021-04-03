import renderMixin from '@/components/renderMixin'

export default {
  name: 'FormNode',
  components: {},

  mixins: [renderMixin],
  props: {
    node: {
      type: Object,
      default: () => {
        return { children: [] }
      },
    },
  },

  computed: {},

  render(createElement) {
    const node = this.node

    const deep_copy = (node) => {
      return JSON.parse(JSON.stringify(node))
    }
    return this.renderNode(createElement, node)
  },

  methods: {
    //

    className222(node) {
      if (node.tagName === 'field') {
        console.log('xxxxxxxx,', node)
      }
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

    renderNode222(createElement, node, parent) {
      if (!node) {
        console.log('error:  parent node,', parent)
        throw 'error node'
      }
      if (typeof node === 'string') {
        return node
      }

      let tagName = node.tagName

      const children = (node.children || []).map((sub_node) => {
        return this.renderNode222(createElement, sub_node, node)
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
        if (this.className222(node)) {
          attribute.class = this.className222(node)
        }
        return createElement(tagName, { ...attribute }, children)
      }
    },
  },
}
