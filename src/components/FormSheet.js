// import ONoteBook from '@/components/ONoteBook.vue'

import OFormSheet from '@/components/OFormSheet.vue'
import OWidgetRibbon from '@/components/OWidgetRibbon.vue'
import OWidgetImage from '@/components/OWidgetImage.vue'
import ButtonBox from '@/components/ButtonBox.js'

import renderMixin from '@/components/renderMixin'

export default {
  name: 'FormSheet',
  components: {
    OFormSheet,
    OWidgetRibbon,
    OWidgetImage,
    ButtonBox,
    WidgetField: () => import('@/components/WidgetField.js'),
  },

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
    const deep_copy = (node) => {
      return JSON.parse(JSON.stringify(node))
    }

    const node = deep_copy(this.node)

    // console.log(' js form sheet,', deep_copy(node))

    // if (item.attr.name === 'button_box') {
    //   return this._view_node_default(item)
    // } else if (item.tagName === 'widget') {
    //   return this._view_node_widget(item)
    // } else if (item.tagName === 'field') {
    //   return this._view_node_field(item)
    // } else if (item.attr.class === 'oe_title') {
    //   return this._view_node_title(item)
    // } else if (item.tagName === 'group') {
    //   return this._view_node_group(item)
    // } else if (item.tagName === 'notebook') {
    //   return this._view_node_notebook(item)
    // } else {
    //   return this._view_node_default(item)
    // }

    return createElement(
      'OFormSheet',
      {},
      node.children.map((item) => {
        // console.log('button_box,', item)
        if (item.name === 'field') {
          return createElement('OWidgetImage', { props: { node: item } }, [])
        } else if (item.attribute.attrs.name === 'button_box') {
          return createElement('ButtonBox', { props: { node: item } })
        } else if (item.attribute.attrs.name === 'web_ribbon') {
          return createElement('OWidgetRibbon', { props: { node: item } }, [])
        } else if (item.attribute.class === 'oe_title') {
          return this.renderNode(createElement, item)
        } else {
          return this.renderNode(createElement, item)
          // return createElement('div', {}, [item.name])
        }
      })
    )
  },

  methods: {},
}
