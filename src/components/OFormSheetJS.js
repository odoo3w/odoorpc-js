// import ONoteBook from '@/components/ONoteBook.vue'

import OFormSheet from '@/components/OFormSheet.vue'
import OWidgetRibbon from '@/components/OWidgetRibbon.vue'
import OWidgetImage from '@/components/OWidgetImage.vue'
import OButtonBoxJS from '@/components/OButtonBoxJS.js'

import ONoteBook from '@/components/ONoteBook.vue'

import renderMixin from '@/components/renderMixin'

export default {
  name: 'OFormSheetJS',
  components: {
    OFormSheet,
    OWidgetRibbon,
    OWidgetImage,
    OButtonBoxJS,
    // OGroup,
    // OInnerGroup,
    ONoteBook
    // OWidgetFieldJS: () => import('@/components/OWidgetFieldJS.js')
  },

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
    const deep_copy = node => {
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
      node.children
        // .filter(item => item.tagName === 'notebook' || item.tagName === 'group')
        .map(item => {
          // console.log('button_box,', item)
          if (item.tagName === 'field') {
            // return createElement('div', {}, ['else:', item.name])
            return createElement('OWidgetImage', { props: { node: item } }, [])
          } else if (item.attribute.attrs.name === 'button_box') {
            // return createElement('div', {}, ['else:', item.name])
            return createElement('OButtonBoxJS', { props: { node: item } })
          } else if (item.attribute.attrs.name === 'web_ribbon') {
            // return createElement('div', {}, ['else:', item.name])
            return createElement('OWidgetRibbon', { props: { node: item } }, [])
          } else if (item.attribute.class === 'oe_title') {
            // return createElement('div', {}, ['else:', item.name])
            return this.renderNode(createElement, item)
          } else if (item.tagName === 'group') {
            return this.renderGroup(createElement, item)
          } else if (item.tagName === 'notebook') {
            return createElement('ONoteBook', { props: { node: item } }, [])
            // return this.renderGroup(createElement, item)
          } else {
            return this.renderNode(createElement, item)
            // return createElement('div', {}, ['else:', item.name])
          }
        })
    )
  },

  methods: {}
}
