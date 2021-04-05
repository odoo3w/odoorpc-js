import OFormLabel from '@/components/OFormLabel.vue'

import renderMixin from '@/components/renderMixin'

export default {
  name: 'FormLabel',
  components: {
    OFormLabel
  },

  mixins: [renderMixin],
  props: {
    node: {
      type: Object,
      default: () => {
        return { children: [] }
      }
    },

    col_6: { type: Boolean, default: false }
  },

  computed: {},

  render(createElement) {
    const node = this.node

    const deep_copy = node => {
      return JSON.parse(JSON.stringify(node))
    }
    // console.log(' Form lable,  ', node.tagName, node)

    const is_OFormLabel =
      node.tagName === 'field' || (node.tagName === 'label' && node.meta.string)

    if (is_OFormLabel) {
      return createElement(
        'OFormLabel',
        { props: { node: node, col_6: this.col_6 } },
        [node.meta.string]
      )
    } else if (node.tagName === 'label') {
      return this.renderNode(createElement, node)
    } else {
      throw 'error  tag name'
    }
  },

  methods: {
    //

    className222(node) {
      if (node.tagName === 'field') {
        console.log('xxxxxxxx,', node)
      }
      const classList = [
        ...(node.attribute.class ? node.attribute.class.split(' ') : [])
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

      const children = (node.children || []).map(sub_node => {
        return this.renderNode222(createElement, sub_node, node)
      })

      if (['OWidgetFieldJS', 'OButton'].includes(tagName)) {
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
    }
  }
}
