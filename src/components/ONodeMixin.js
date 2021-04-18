export default {
  props: {
    editable: { type: Boolean, default: undefined },
    record: {
      type: Object,
      default: () => {
        return {}
      }
    },
    node: {
      type: [Object, String, Number], // 子元素 可能是文本字符串 或者 node
      default: () => {
        return { children: [] }
      }
    }
  },

  computed: {
    //
  },

  async created() {},

  methods: {
    onFieldChange(field, value) {
      //   console.log('onFieldChange', field, value)
      this.$emit('on-field-change', field, value)
    }
  }
}
