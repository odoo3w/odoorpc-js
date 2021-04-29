<template>
  <div>
    <div>
      <div>&nbsp;</div>

      <Divider />

      {{ this.value }}

      <!-- @on-search-more="handleOnSearchMore" -->

      <OM2oSelect
        v-model="value"
        :default-value="defaultValue"
        :default-label="defaultLabel"
        :options="options"
        :showSearchMoreButton="showSearchMore"
        modalTitle="搜索"
        placeholder="input here"
        @on-change="handleOnChange"
        @on-search="handleOnSearch"
        @on-search-more="handleOnSearchMore"
        style="width:200px"
      >
        <Option v-for="op in options" :key="op[0]" :value="op[0]">{{
          op[1]
        }}</Option>
      </OM2oSelect>
    </div>
  </div>
</template>

<script>
import api from '@/api'

import OM2oSelect from '@/components/OWidgetField/OM2oSelect'

// import { sleep } from '@/utils'

export default {
  name: 'Home',
  components: { OM2oSelect },
  mixins: [],

  data() {
    return {
      value: 0,
      defaultValue: 0,
      defaultLabel: '',

      showSearchMore: false,

      page: 0,

      options: [],

      list2: [
        [11, '11北京'],
        [12, '12上海'],
        [13, '13深圳'],
        [14, '14杭州'],
        [15, '15广州'],
        [21, '21北京'],
        [22, '22上海'],
        [23, '23深圳'],
        [24, '24杭州'],
        [25, '25广州'],
        [31, '31北京'],
        [32, '32上海'],
        [33, '33深圳'],
        [34, '34杭州'],
        [35, '35广州']
      ]
    }
  },
  computed: {
    //
  },
  async created() {
    this.init()
  },

  methods: {
    async init() {
      this.value = 48
      this.defaultValue = 48
      this.defaultLabel = '中国'
      this.options = [[this.defaultValue, this.defaultLabel]]

      const options = await this.get_selection()
      this.options = options
    },

    async _get_selection(query) {
      // console.log('_get_selection, ', query)
      const Model = api.env.model('res.country')
      const kwargs = { args: [], name: query, limit: 8 }
      const res = await Model.execute_kw('name_search', [], kwargs)
      return [...res]
    },

    async get_selection(query) {
      // console.log('get_selection', JSON.stringify(query))
      const options = await this._get_selection(query)
      // await sleep(1000)
      const options1 = options.slice(0, 7)
      const show_search_more = options.length > options1.length
      this.showSearchMore = show_search_more

      const options2 = options1.filter(item => item[0] !== this.defaultValue)

      const default_list = this.defaultValue
        ? [[this.defaultValue, this.defaultLabel]]
        : []

      return [...default_list, ...options2]
    },

    handleOnChange(value) {
      console.log('handleOnChange,', [value, this.value])
      // // this.value2 = value
      // this.$emit('on-change', value)
    },

    handleOnSearch(query) {
      console.log('handleOnSearch', [query])
    },

    async handleOnSearchMore() {
      console.log('handleOnSearchMore')
      // const options = await this.get_selection()
      // this.options = options

      const Model = api.env.model('res.country')
      const ps = await Model.pageSearch([], { pageSize: 80 })
      const records = await ps.pageFirst()

      console.log('handleOnSearchMore', records.fetch_all())
    }
  }
}
</script>

<style type="text/css"></style>
