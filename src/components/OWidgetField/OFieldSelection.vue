<template>
  <div v-if="editable" :class="className" :name="node.attribute.attrs.name">
    <Select
      v-model="value2"
      clearable
      transfer
      :placeholder="node.attribute.attrs.placeholder"
      style="width:200px"
      @on-open-change="handelOnOpenChange"
      @on-change="handleOnchange"
    >
      <Option v-for="item in options" :value="item[0]" :key="item[0]">{{
        item[1]
      }}</Option>
    </Select>
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
  async created() {},

  async mounted() {
    //
    // console.log('selection create', this.record._name, this.record)
    // console.log('m2o create', this.record._name, [this.record.get_selection])
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

    handelOnOpenChange(value) {
      // console.log('handelOnOpenChange', p)
      if (value) {
        this.getSelectOptions()
      }
    },

    btnClick() {
      console.log('btnClick', this.node.meta)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
