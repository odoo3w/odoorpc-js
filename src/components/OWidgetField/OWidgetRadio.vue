<template>
  <div v-if="editable" :class="className" :name="node.attribute.attrs.name">
    <RadioGroup v-model="value2" @on-change="handleOnchange">
      <Radio v-for="one in options2" :key="one[0]" :label="one[0]">
        <span>{{ one[1] }}</span>
      </Radio>
    </RadioGroup>
  </div>

  <span v-else :class="className" :name="node.attribute.attrs.name">
    {{ node.meta.valueName }}
  </span>
</template>

<script>
import OFieldMixin from './OFieldMixin'

export default {
  name: 'OFieldSelection',

  mixins: [OFieldMixin],
  props: {},

  data() {
    return {
      options: [],
      selectOptionLoading: false,
      query: ''
    }
  },

  computed: {
    options2() {
      //
      if (this.node.meta.type === 'selection') {
        return this.node.meta.selection
      } else {
        return this.options
      }
    },
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

      if (this.editable) {
        // classList.push('o_input')
        classList.push('o_field_selection')
        classList.push('o_field_widget')
      } else {
        classList.push('o_field_selection')
        classList.push('o_field_widget')
      }

      if (node.meta.invisible) {
        classList.push('o_invisible_modifier')
      }
      if (node.meta.readonly) {
        classList.push('o_readonly_modifier')
      }
      if (node.meta.required) {
        classList.push('o_required_modifier')
      }
      return classList.join(' ')
    }
  },
  async created() {
    // console.log('radio', this.options2)
  },

  async mounted() {
    // console.log('radio create', this.node)
    // console.log('radio create', this.record._name, this.record)
    // console.log('radio create', this.record._name, [this.record.get_selection])
    // if (this.record.get_selection) {
    //   const res = await this.record.get_selection(this.node.meta.name, {
    //     default: true
    //   })
    //   // console.log('dropdown', res)
    //   this.options = [...res]
    // }
  },

  methods: {
    async getSelectOptions(query = '') {
      this.selectOptionLoading = true
      const res = await this.record.get_selection(this.node.meta.name, {
        name: query
      })
      this.selectOptionLoading = false
      console.log('getSelectOptions', res)
      this.options = [...res]
    },

    btnClick() {
      console.log('btnClick', this.node.meta)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
