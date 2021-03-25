export default {
  name: 'TagTemplate',
  components: {},
  mixins: [],
  props: {
    tag: {
      type: Object,
      default: () => {
        return {}
      },
    },
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

    const node = this.tag

    return this.renderMe(createElement, node)

    // return createElement(
    //   node.tagName, {},
    // )
  },

  methods: {
    //

    renderMe(createElement, node) {
      const children = (node.children || []).map((sub_node) => {
        return this.renderMe(createElement, sub_node)
      })

      return createElement(node.tagName, { ...node.attr }, children)
    },
  },
}
