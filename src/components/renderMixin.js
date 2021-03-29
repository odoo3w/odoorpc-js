export default {
  // name: 'ORender',
  // props: {},

  components: {
    WidgetField: () => import('@/components/WidgetField.js'),
    OButton: () => import('@/components/OButton.vue'),
  },

  data() {
    return {
      is_title: 0,
      list: [],
    }
  },

  methods: {
    renderNode(createElement, node, parent) {
      if (!node) {
        console.log('error:  parent node,', parent)
        throw 'error node'
      }
      if (typeof node === 'string') {
        return node
      }

      let tagName = node.tagName

      if (node.tagName === 'field') {
        tagName = 'WidgetField'
      } else if (node.tagName === 'button') {
        tagName = 'OButton'
      } else if (node.tagName === 'group') {
        tagName = 'div'
      } else if (node.tagName === 'notebook') {
        tagName = 'div'
      } else if (node.tagName === 'page') {
        tagName = 'div'
      } else if (node.tagName === 'separator') {
        tagName = 'div'
      } else if (node.tagName === 'header') {
        tagName = 'div'
      }

      const children = (node.children || []).map((sub_node) => {
        return this.renderNode(createElement, sub_node, node)
      })

      return createElement(
        tagName,
        { props: { node: node }, class: node.attribute.class },
        children
      )

      //
      // const { tagName, attribute = {}, meta = {}, children = [] } = node
      // console.log(node.tagName, node)
      // const className = this._className(node)
      // if (tagName === 'sheet') {
      //   return createElement('OFormSheet', { ...attribute, class: className })
      // } else {
      //   return createElement(tagName, { ...attr, class: className }, [
      //     tagName,
      //     attr.class,
      //   ])
      // }
    },
  },
}
