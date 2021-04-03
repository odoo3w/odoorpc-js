// import ONoteBook from '@/components/ONoteBook.vue'

import OFormSheet from '@/components/OFormSheet.vue'
import OWidgetRibbon from '@/components/OWidgetRibbon.vue'
import OWidgetImage from '@/components/OWidgetImage.vue'
import ButtonBox from '@/components/ButtonBox.js'
import OGroup from '@/components/OGroup.vue'

import renderMixin from '@/components/renderMixin'

export default {
  name: 'FormSheet',
  components: {
    OFormSheet,
    OWidgetRibbon,
    OWidgetImage,
    ButtonBox,
    OGroup,
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
        if (item.tagName === 'field') {
          // return createElement('div', {}, ['else:', item.name])
          return createElement('OWidgetImage', { props: { node: item } }, [])
        } else if (item.attribute.attrs.name === 'button_box') {
          // return createElement('div', {}, ['else:', item.name])
          return createElement('ButtonBox', { props: { node: item } })
        } else if (item.attribute.attrs.name === 'web_ribbon') {
          // return createElement('div', {}, ['else:', item.name])
          return createElement('OWidgetRibbon', { props: { node: item } }, [])
        } else if (item.attribute.class === 'oe_title') {
          // return createElement('div', {}, ['else:', item.name])
          return this.renderNode(createElement, item)
        } else if (item.tagName === 'group') {
          return this.renderGroup(createElement, item)
        } else {
          return this.renderNode(createElement, item)
          // return createElement('div', {}, ['else:', item.name])
        }
      })
    )
  },

  methods: {
    renderGroupOuter(createElement, node) {
      // console.log('group,outer ', node)
      // return createElement('div', {}, ['group outer'])
      return createElement('OGroup', { props: { node: node } })
      // return this.renderNode(createElement, node)
    },
    renderGroup(createElement, node) {
      const check_type = () => {
        if (!node.children) {
          return 0
        }
        if (node.children.length !== 2) {
          return 1
        }
        const child0 = node.children[0]
        const child1 = node.children[0]

        if (child0.tagName === 'group' && child1.tagName === 'group') {
          return 2
        } else {
          return 1
        }
      }

      const my_type = check_type()
      // console.log('group,', my_type, node)

      if (my_type === 1) {
        // return this.renderGroupOne(node)
        return this.renderNode(createElement, node)
      } else if (my_type === 2) {
        // return this.renderNode(createElement, node)
        return this.renderGroupOuter(createElement, node)
      } else {
        return this.renderNode(createElement, node)
      }
    },
  },
}
