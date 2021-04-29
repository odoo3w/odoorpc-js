<template>
  <span v-if="editable" :class="className" :name="node.attrs.name">
    <OM2mSelect
      v-model="value2"
      :showSearchMore="showSearchMore"
      :placeholder="node.attrs.placeholder"
      style="width:200px"
      @on-change="handleOnchange"
    >
      <Option v-for="op in options" :key="op[0]" :value="op[0]">{{
        op[1]
      }}</Option>
    </OM2mSelect>
  </span>

  <span v-else :class="className">
    <Tag v-for="one in value_dataList" :key="one.id">
      {{ one.display_name }}
    </Tag>
  </span>
</template>

<script>
import OFieldMixin from './OFieldMixin'

import OM2mSelect from '@/components/OWidgetField/OM2mSelect'

export default {
  name: 'OWidgetMany2manyTags',
  components: { OM2mSelect },
  mixins: [OFieldMixin],
  props: {},
  data() {
    return {
      showSearchMore: false,
      // dataList: [],
      options: []
    }
  },
  computed: {
    value2: {
      get() {
        return this.dataDict[this.node.attrs.name] || []
      },
      set(value) {
        this.value = value
      }
    },
    value_dataList() {
      return this.dataDict[`${this.node.attrs.name}__record`] || []
    },

    className() {
      const classList = []

      if (this.editable) {
        // classList.push('o_field_many2manytags')
        // classList.push('o_field_widget')
        // classList.push('o_input')
      } else {
        classList.push('o_field_many2manytags')
        classList.push('o_field_widget')
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
      return classList.join(' ')
    }
  },
  async created() {
    // const deep_copy = node => {
    //   return JSON.parse(JSON.stringify(node))
    // }
    // console.log(
    //   'OWidget M2M xxxxxx:',
    //   this.node.meta.name,
    //   deep_copy(this.node)
    // )
    // console.log(this.record)
  },

  async mounted() {
    await this.init()
    // const deep_copy = node => {
    //   return JSON.parse(JSON.stringify(node))
    // }
    // console.log(
    //   'OWidget M2M xxxxxx:',
    //   this.node.meta.name,
    //   deep_copy(this.node)
    // )
  },

  methods: {
    async init() {
      // const m2m_record = await this.record[`$$${this.node.attrs.name}`]
      // const m2m_record =
      await this.record[`$${this.node.attrs.name}`]
      // console.log('m2m, ', this.node.attrs.name, m2m_record)
      // console.log('m2m, ', this.node.attrs.name, this.dataDict)

      if (this.editable) {
        const options = await this._getSelectOptions()
        console.log(
          'm2m, ',
          new Date().getTime(),
          this.node.attrs.name,
          options
        )
        this.options = options
      }
    },

    async _getSelectOptions(query = '') {
      const domain = this.node.attrs.domain
      const context = this.node.attrs.context
      // console.log('getSelectOptions', query, domain, context)
      // this.selectOptionLoading = true
      if (!this.editable || !this.record.get_selection) {
        return []
      }
      const options0 = await this.record.get_selection(this.node.attrs.name, {
        name: query,
        domain,
        context
      })

      // await sleep(1000)
      const options = options0.slice(0, 3)

      const options1 = options.slice(0, 7)
      const show_search_more = options.length > options1.length
      this.showSearchMore = show_search_more

      return options1
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
