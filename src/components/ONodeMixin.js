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
    },
    dataDict: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },

  computed: {
    invisible_modifier() {
      const invisible_modifier = this.get_attr_of_modifier('invisible')
      return invisible_modifier
    },

    readonly_modifier() {
      return this.get_attr_of_modifier('readonly')
    },
    required_modifier() {
      return this.get_attr_of_modifier('required')
    }
  },

  async created() {},

  methods: {
    get_attr_of_modifier(attr) {
      // 额外 多传一个参数 this.dataDict
      // 这样 当 this.dataDict 变化时, 会重新计算
      const fn_name = `_view_${attr}`
      if (this.record[fn_name]) {
        const attr_of_modifier = this.record[fn_name](this.node, this.dataDict)
        return attr_of_modifier
      } else {
        return false
      }
    }
  }
}
