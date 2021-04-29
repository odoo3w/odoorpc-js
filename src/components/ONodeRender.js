import ONodeMixin from '@/components/ONodeMixin'

// let count_me = 1
// let last_time = 0

export default {
  name: 'ONode',
  components: {
    OWidgetField: () => import('@/components/OWidgetField'),
    OButton: () => import('@/components/OButton'),
    OImg: () => import('@/components/OImg'),
    OGroup: () => import('@/components/OGroup')
  },

  mixins: [ONodeMixin],
  props: {
    parent: {
      type: [Object, String], // 子元素 可能是文本字符串 或者 node
      default: undefined
    }
  },

  computed: {},

  render(createElement) {
    // const node = this.node
    return this.renderNode(createElement)
  },

  methods: {
    className(node) {
      const classList = [...(node.class ? node.class.split(' ') : [])]
      if (this.invisible_modifier) {
        classList.push('o_invisible_modifier')
      }
      if (this.readonly_modifier) {
        classList.push('o_readonly_modifier')
      }
      if (this.required_modifier) {
        classList.push('o_required_modifier')
      }
      return classList.join(' ')
    },

    renderNode(createElement) {
      const parent = this.parent
      const record = this.record
      const node = this.node
      const dataDict = this.dataDict
      const editable = this.editable

      // count_me = count_me + 1
      // const this_time = new Date().getTime()

      // const deep_copy = node => {
      //   return JSON.parse(JSON.stringify(node))
      // }

      // if (this_time - last_time > 30) {
      //   console.log(
      //     'date 300,',
      //     count_me,
      //     this_time - last_time,
      //     this_time,
      //     last_time,
      //     deep_copy(node)
      //   )
      // } else {
      //   console.log(
      //     'date 300,',
      //     count_me,
      //     this_time - last_time,
      //     this_time,
      //     last_time
      //     // deep_copy(node)
      //   )
      // }

      // last_time = this_time

      // if (node.tagName === 'label') {
      //   console.log('ONode, node, xxxxxx:', node.tagName, deep_copy(node))
      // }
      // console.log('ONode, data, xxxxxx:', dataDict)

      // console.log('ONode, xxxxxx:', this.editable)
      // console.log('ONode, xxxxxx:', this.record)

      // console.log(' me,  parent node,', deep_copy(node), parent)

      const is_node = node => {
        if (typeof node !== 'object') {
          return false
        }
        if (Array.isArray(node)) {
          return false
        }
        if (typeof node === 'boolean') {
          return false
        }

        return true
      }

      // console.log('ONode, xxxxxx: 2,', is_node(node))

      if (!is_node(node)) {
        // 单字符串 做节点, 只能加上一个  span, 如果要去掉 span, 只能在上一级, 处理掉
        return createElement('span', {}, [node])
      }

      if (!node) {
        console.log('error:  parent node,', parent)
        throw 'error node'
      }

      if (node.tagName === 'group') {
        return createElement('OGroup', {
          props: { record, parent, node, dataDict, editable }
        })
      }

      if (node.tagName === 'field') {
        return createElement('OWidgetField', {
          props: { record, parent, node, dataDict, editable }
        })
      }

      if (node.tagName === 'button') {
        return createElement('OButton', {
          props: { record, parent, node, dataDict, editable }
        })
      }

      if (node.tagName === 'img') {
        return createElement('OImg', {
          props: { record, parent, node, dataDict, editable }
        })
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
        return createElement('ONode', {
          props: { record, parent: node, node: sub_node, dataDict, editable }
        })
      })

      return createElement(
        tagName,
        {
          attrs: { ...node.attrs },
          class: this.className(node),
          props: { record, node, dataDict, editable }
        },
        children
      )
    }
  }
}
