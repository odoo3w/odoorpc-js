import renderMixin from '@/components/renderMixin.js'

import OFormView from '@/components/OFormView.vue'
import OFormHeader from '@/components/OFormHeader.vue'
import FormSheet from '@/components/FormSheet.js'
import OFormChatter from '@/components/OFormChatter.vue'

export default {
  name: 'FormView',

  components: { OFormView, OFormHeader, FormSheet, OFormChatter },
  mixins: [renderMixin],
  props: {
    readonly: { type: Boolean, default: undefined },
    node: {
      type: Object,
      default: () => {
        return {
          children: [],
        }
      },
    },
  },

  data() {
    return {}
  },
  computed: {},

  render(createElement) {
    // console.log('form view js ', this.node)

    const deep_copy = (node) => {
      return JSON.parse(JSON.stringify(node))
    }

    const node = deep_copy(this.node)

    console.log('form view js ', node)

    const attribute = node.attribute || {}
    const children0 = node.children || []

    const chatter = children0.filter(
      (item) => item.attribute && item.attribute.class === 'oe_chatter'
    )
    const children = children0.filter(
      (item) => !(item.attribute && item.attribute.class === 'oe_chatter')
    )

    return createElement('OFormView', { attrs: attribute.attrs || {} }, [
      ...children.map((item) => {
        if (item.tagName === 'sheet') {
          return createElement('FormSheet', { props: { node: item } }, [
            item.tagName,
          ])
        } else if (item.name === 'header') {
          return createElement('OFormHeader', { props: { node: item } }, [
            item.tagName,
          ])
        } else {
          // partner 页面 有个  alert 需要单独处理
          return this.renderNode(createElement, item)
        }
      }),
      ...chatter.map((item) => {
        // return this.renderNode(createElement, item)
        return createElement(
          'OFormChatter',
          {
            class: (item.attribute || {}).class,
            slot: 'chatter',
          },
          [item.name, item.attribute.class]
        )
      }),
    ])

    // return createElement('OContent', [this.renderMe(createElement, node)])
  },

  methods: {
    // renderMe(createElement, node) {
    //   if (
    //     node.attr &&
    //     node.attr.attrs &&
    //     node.attr.attrs.name === 'child_ids'
    //   ) {
    //     console.log('rnder me, ', node)
    //   }
    //   let children = (node.children || []).map((sub_node) => {
    //     if (typeof sub_node === 'object') {
    //       return this.renderMe(createElement, sub_node)
    //     } else {
    //       return sub_node
    //       // return createElement('div', {}, sub_node)
    //     }
    //   })
    //   if (!node.isParent && node.content) {
    //     if (node.content.trim()) {
    //       children = node.content
    //     }
    //   }
    //   // console.log(node.attr)
    //   const attr = {
    //     ...node.attr,
    //   }
    //   if (node.tabChanged) {
    //     attr.on = {
    //       click: () => {
    //         this.tabChanged(node.tabChanged)
    //       },
    //     }
    //   }
    //   return createElement(node.tagName, attr, children)
    // },
    // tabChanged(payload) {
    //   const { callback, index } = payload
    //   callback(index)
    // },
  },
}
