import renderMixin from '@/components/aadell/zzzrenderMixin'

import OFormHeader from '@/components/OFormHeader'
import OFormSheet from '@/components/OFormSheet'

export default {
  name: 'OFormViewItem',
  components: { OFormHeader, OFormSheet },

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
      if (node.name === 'header') {
        return createElement('OFormHeader', { props: { node } })
      } else if (node.tagName === 'sheet') {
        return createElement('OFormSheet', { props: { node } })
      } else {
        // partner 页面 有个  alert 需要单独处理
        return this.renderNode(createElement, node)
      }
    }
  }
}
