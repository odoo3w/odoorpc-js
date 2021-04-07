export default {
  // props: {},

  components: {
    OWidgetField: () => import('@/components/OWidgetField'),
    OButton: () => import('@/components/OButton.vue'),
    OGroup: () => import('@/components/OGroup.vue')
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

      const deep_copy = node => {
        return JSON.parse(JSON.stringify(node))
      }

      if (node === 'Create company') {
        console.log(' me,  parent node,', deep_copy(node), parent)
        console.log(' me,  parent node,', typeof node)
      }

      if (!node) {
        console.log('error:  parent node,', parent)
        throw 'error node'
      }
      if (typeof node === 'string') {
        // 单字符串 做节点, 只能加上一个  span, 如果要去掉 span, 只能在上一级, 处理掉
        return createElement('span', {}, [node])
      }

      if (node.tagName === 'group') {
        return createElement('OGroup', { props: { node: node } })
      }

      if (node.tagName === 'field') {
        return createElement('OWidgetField', { props: { node: node } })
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
    }
  }
}
