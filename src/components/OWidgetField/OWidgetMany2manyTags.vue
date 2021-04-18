<template>
  <span v-if="editable" :class="className" :name="node.attribute.attrs.name">
    <!-- <Tag v-for="one in dataList" :key="one.id"> {{ one.name }} </Tag> -->
    {{ value2 }}
    <OSelect v-model="value2" multiple>
      <Option v-for="op in dataList" :key="op.id" :value="op.id">{{
        op.name
      }}</Option>
    </OSelect>
    <!-- <span
    :class="className"
    :name="node.attribute.attrs.name"
    :placeholder="node.attribute.attrs.placeholder"
  >
    {{ node.meta.valueName }}
  </span> -->
  </span>

  <span v-else :class="className">
    <Tag v-for="one in dataList" :key="one.id"> {{ one.name }} </Tag>
  </span>
</template>

<script>
import OFieldMixin from './OFieldMixin'

import OSelect from '@/components/OWidgetField/OSelect'

export default {
  name: 'OWidgetMany2manyTags',
  components: { OSelect },
  mixins: [OFieldMixin],
  props: {},
  data() {
    return {
      dataList: []
    }
  },
  computed: {
    value2: {
      get() {
        return this.node.meta.value || []
      },
      set(value) {
        this.node.meta.value = value
      }
    },

    className() {
      const node = this.node
      const classList = []

      if (this.editable) {
        // classList.push('o_field_many2manytags')
        // classList.push('o_field_widget')
        // classList.push('o_input')
      } else {
        classList.push('o_field_many2manytags')
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
    const deep_copy = node => {
      return JSON.parse(JSON.stringify(node))
    }
    console.log(
      'OWidget M2M xxxxxx:',
      this.node.meta.name,
      deep_copy(this.node)
    )

    console.log(this.dataList)
  },

  methods: {
    async init() {
      const m2m_record = await this.record[`$$${this.node.meta.name}`]
      // const m2m_record = this.record[`$${this.node.meta.name}`]
      // console.log('m2m, ', this.node.meta.name, m2m_record)
      const dataList = m2m_record.fetch_all()
      this.dataList = dataList

      const options = this._getSelectOptions()
      console.log(options)
    },

    async _getSelectOptions(query = '') {
      const domain = this.node.attribute.attrs.domain
      const context = this.node.attribute.attrs.context
      // console.log('getSelectOptions', query, domain, context)
      // this.selectOptionLoading = true
      if (!this.editable || !this.record.get_selection) {
        return []
      }
      const options = await this.record.get_selection(this.node.meta.name, {
        name: query,
        domain,
        context
      })

      // await sleep(1000)

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
