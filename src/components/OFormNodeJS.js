import renderMixin from '@/components/renderMixin'

export default {
  name: 'OFormNodeJS',
  components: {},

  mixins: [renderMixin],
  props: {
    node: {
      type: Object,
      default: () => {
        return { children: [] }
      }
    }
  },

  computed: {},

  render(createElement) {
    const node = this.node

    const deep_copy = node => {
      return JSON.parse(JSON.stringify(node))
    }
    return this.renderNode(createElement, node)
  },

  methods: {}
}
