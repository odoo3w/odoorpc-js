import ONodeMixin from '@/components/ONodeMixin'

export default {
  mixins: [ONodeMixin],
  props: {},

  data() {
    return {
      value: undefined
    }
  },

  computed: {
    value2: {
      get() {
        return this.dataDict[this.node.attrs.name]
      },
      set(value) {
        this.value = value
      }
    },
    valueName() {
      return this.value2
    },

    meta() {
      if (this.record._columns) {
        const meta = this.record._columns[this.node.attrs.name]
        return meta
      } else {
        return {}
      }
    },

    input_id() {
      return this.meta.getInputId(this.record)
    },

    className() {
      const classList = []
      classList.push(`o_field_${this.meta.type}`)
      classList.push('o_field_widget')

      if (this.node.class) {
        classList.push(this.node.class)
      }

      if (this.invisible_modifier) {
        classList.push('o_invisible_modifier')
      }
      if (this.readonly_modifier) {
        classList.push('o_readonly_modifier')
      }
      if (this.required_modifier) {
        classList.push('o_required_modifier')
      }

      if (!this.editable && !this.value2) {
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
    async handleOnchange(value) {
      console.log('minxin, handleOnchange', [value, this.record, this.node])
      const field = `$${this.node.attrs.name}`
      this.record[field] = value
      // await this.record.awaiter
      console.log(' change ok,', this.dataDict)
      // const vals = this.record._get_values_for_write()
      // console.log(' change ok,', vals)
    }
  }
}
