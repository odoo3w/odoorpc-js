export default {
  // props: {},

  components: {
    OWidgetFieldJS: () => import('@/components/OWidgetFieldJS.js'),
    OButton: () => import('@/components/OButton.vue'),
    OGroup: () => import('@/components/OGroup.vue'),
    OInnerGroup: () => import('@/components/OInnerGroup.vue')
  },

  data() {
    return {
      is_title: 0,
      list: []
    }
  },

  methods: {
    className(node) {
      const classList = [
        ...(node.attribute.class ? node.attribute.class.split(' ') : [])
      ]
      const meta = node.meta || {}
      if (meta.invisible) {
        classList.push('o_invisible_modifier')
      }
      if (meta.readonly) {
        classList.push('o_readonly_modifier')
      }
      if (meta.required) {
        classList.push('o_required_modifier')
      }
      return classList.join(' ')
    },

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
        return this.renderGroup(createElement, node, payload)
      }

      if (node.tagName === 'field') {
        return createElement('OWidgetFieldJS', { props: { node: node } })
      }

      if (node.tagName === 'button') {
        return createElement('OButton', { props: { node: node } })
      }

      let tagName = node.tagName

      if (node.tagName === 'notebook') {
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
    },

    renderGroup(createElement, node, payload = {}) {
      const { level = 0 } = payload
      // console.log(
      //   'group,xxxxxxxx, is:',
      //   node.attribute.attrs.name,
      //   node.children.length,
      //   node
      // )

      const is_inner_group =
        node.children &&
        node.children.length &&
        node.children[0].tagName !== 'group'

      if (is_inner_group) {
        return createElement('OInnerGroup', { props: { node: node, level } })
      } else {
        return createElement('OGroup', { props: { node: node, level } }, [
          node.children.map(item =>
            this.renderGroup(createElement, item, { level: level + 1 })
          )
        ])
      }
    }
  }
}
