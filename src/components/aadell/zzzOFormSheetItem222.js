import renderMixin from '@/components/aadell/zzzrenderMixin'

import OWidgetRibbon from '@/components/OWidgetField/OWidgetRibbon'
import OWidgetImage from '@/components/OWidgetField/OWidgetImage'
import OButtonBox from '@/components/OButtonBox.vue'
import ONoteBook from '@/components/ONoteBook.vue'

export default {
  name: 'OFormSheetJS',
  components: { OWidgetRibbon, OWidgetImage, OButtonBox, ONoteBook },

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
      if (node.tagName === 'field') {
        return createElement('OWidgetImage', { props: { node } }, [])
      } else if (node.attribute.attrs.name === 'button_box') {
        return createElement('OButtonBox', { props: { node } })
      } else if (node.attribute.attrs.name === 'web_ribbon') {
        return createElement('OWidgetRibbon', { props: { node } }, [])
      } else if (node.attribute.class === 'oe_title') {
        return this.renderNode(createElement, node)
      } else if (node.tagName === 'group') {
        return this.renderGroup(createElement, node)
      } else if (node.tagName === 'notebook') {
        return createElement('ONoteBook', { props: { node } }, [])
      } else {
        return this.renderNode(createElement, node)
      }
    }
  }
}
