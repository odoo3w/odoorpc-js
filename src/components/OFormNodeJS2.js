import renderMixin from '@/components/renderMixin'

export default {
  name: 'OFormNodeJS',
  components: {},

  mixins: [renderMixin],
  props: {
    node: {
      type: Object,
      default: () => {
        return { children: [] }
      }
    }
  },

  data() {
    return {
      //
    }
  },

  computed: {},

  render(createElement) {
    const node = this.node

    const deep_copy = node => {
      return JSON.parse(JSON.stringify(node))
    }
    return this.renderNode(createElement, node)
  },

  methods: {
    renderNode(createElement, node, payload = {}) {
      const { parent } = payload

      if (!node) {
        console.log('error:  parent node,', parent)
        throw 'error node'
      }
      if (typeof node === 'string') {
        return node
      }

      if (node.tagName === 'group') {
        // return this.renderGroup(createElement, node, payload)
      }

      let tagName = node.tagName

      if (node.tagName === 'field') {
        tagName = 'OWidgetFieldJS'
      } else if (node.tagName === 'button') {
        tagName = 'OButton'
        // } else if (node.tagName === 'group') {
        //   tagName = 'div'
      } else if (node.tagName === 'notebook') {
        tagName = 'div'
      } else if (node.tagName === 'page') {
        tagName = 'div'
      } else if (node.tagName === 'separator') {
        tagName = 'div'
      } else if (node.tagName === 'header') {
        tagName = 'div'
      }

      const children = (node.children || []).map(sub_node => {
        return this.renderNode(createElement, sub_node, {
          ...payload,
          parent: node
        })
      })

      return createElement(
        tagName,
        {
          ...node.attribute,
          class: this.className(node),
          props: { node: node }
        },
        children
      )
    }
  }
}
