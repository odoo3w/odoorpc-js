export default {
  name: 'FormView',
  components: {},
  mixins: [],
  props: {
    readonly: { type: Boolean, default: undefined },
    record: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  computed: {},

  render(createElement) {
    if (!this.record) {
      return <div> </div>
    }

    const node = this.record.view_xml2html({ readonly: this.readonly })
    return this.renderMe(createElement, node)
  },

  methods: {
    renderMe(createElement, node) {
      let children = (node.children || []).map((sub_node) => {
        if (typeof sub_node === 'object') {
          return this.renderMe(createElement, sub_node)
        } else {
          return sub_node
          // return createElement('div', {}, sub_node)
        }
      })

      if (!node.isParent && node.content) {
        children = node.content
      }

      // console.log(node.attr)

      const attr = {
        ...node.attr,
      }

      if (node.onClick) {
        attr.on = {
          click: () => {
            this.onClick(node.onClick)
          },
        }
      }

      return createElement(node.tagName, attr, children)
    },

    onClick(payload) {
      console.log('onclick', payload)
    },
  },
}
