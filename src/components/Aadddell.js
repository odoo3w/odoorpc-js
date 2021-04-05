import renderMixin from '@/components/renderMixin'

const deep_copy = node => {
  return JSON.parse(JSON.stringify(node))
}

export default {
  name: 'OInnerGroupTd',
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

  computed: {},

  render(createElement) {
    const node = this.node

    const deep_copy = node => {
      return JSON.parse(JSON.stringify(node))
    }
    return this.renderMe(createElement, node)
  },

  async created() {
    // console.log('OInnerGroupTd, xxxxxx:', this.seq, deep_copy(this.node))
  },
  methods: {
    renderMe(createElement, node) {
      // console.log('td', node)
      const children = (node.children || []).map(sub => {
        if (sub.tagName === 'label') {
          // return createElement('div', {}, ['label'])
          // 这个 需要 处理 class
          return this.renderNode(createElement, sub, { parent: node })
        } else if (sub.tagName === 'field') {
          // return createElement('div', {}, ['field'])
          return this.renderNode(createElement, sub, { parent: node })
        } else {
          return this.renderNode(createElement, sub, { parent: node })
        }

        // return this.renderNode(createElement, sub_node, node)
      })

      const attribute = {}
      if (node.attribute.attrs && Object.keys(node.attribute.attrs).length) {
        attribute.attrs = { ...node.attribute.attrs }
      }
      if (this.className(node)) {
        attribute.class = this.className(node)
      }
      // return createElement('td', { ...attribute }, ['tdddd'])
      return createElement('td', { ...attribute }, children)
    }
  }
}
