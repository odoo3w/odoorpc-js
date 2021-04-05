import OButtonBox from '@/components/OButtonBox.vue'
import OButton from '@/components/OButton.vue'

import renderMixin from '@/components/renderMixin'

export default {
  name: 'ButtonBox',
  components: { OButtonBox, OButton },

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

    return createElement(
      'OButtonBox',
      { class: node.attribute.class },
      node.children.map((item) => {
        if (item.name === 'button') {
          return createElement(
            'OButton',
            { props: { node: item }, class: item.attribute.class },
            (item.children || []).map((el) => {
              return this.renderNode(createElement, el)
            })
          )
        } else {
          return this.renderNode(createElement, item)
          // return createElement('div', {}, [item.name])
        }
      })
    )
  },

  methods: {},
}
