export default {
  name: 'TagTemplate',
  components: {},
  mixins: [],
  props: {
    node: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },

  computed: {},

  render(createElement) {
    const node = this.tag

    return this.renderMe(createElement, node)

    // return createElement(
    //   node.tagName, {class: node.attribute.class },
    //   (node.children || []).map((item) => {
    //     return 'but ele'
    //   })

    // )
  },

  methods: {
    //

    renderMe(createElement, node) {
      if (typeof node === 'string') {
        return node
      }

      const children = (node.children || []).map((sub_node) => {
        return this.renderMe(createElement, sub_node)
      })

      return createElement(
        node.tagName,
        { class: node.attribute.class },
        children
      )
    },
  },
}
