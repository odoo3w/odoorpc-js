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
      type: Object,
      default: () => {
        return { children: [] }
      }
    }
  },

  computed: {
    value2: {
      get() {
        return this.node.meta.value || ''
      },
      set(value) {
        this.node.meta.value = value
      }
    },

    className() {
      const node = this.node
      const classList = []
      classList.push(`o_field_${node.meta.type}`)
      classList.push('o_field_widget')

      if (node.attribute.class) {
        classList.push(node.attribute.class)
      }

      // if (this.editable) {
      //   classList.push('o_input')
      // }

      if (node.meta.invisible) {
        classList.push('o_invisible_modifier')
      }
      if (node.meta.readonly) {
        classList.push('o_readonly_modifier')
      }
      if (node.meta.required) {
        classList.push('o_required_modifier')
      }

      if (!this.editable && !node.meta.value) {
        classList.push('o_field_empty')
      }

      return classList.join(' ')
    }
  },

  async created() {
    //
    // console.log('char create', this.record)
  },
  methods: {
    handleOnchange(value) {
      console.log('minxin, handleOnchange', value, this.record, this.node)
      const field = `$${this.node.meta.name}`
      this.record[field] = value
    }
  }
}
