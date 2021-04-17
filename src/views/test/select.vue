<template>
  <div>
    <div>
      <div>&nbsp;</div>

      <div>currentValue: {{ value }}</div>
      <!-- <div>options: {{ options }}</div> -->

      <SelectM2o
        v-model="value2"
        :label.sync="label"
        :loading="loading"
        :remote-method="remoteMethod"
        placeholder="input here"
        style="width:200px"
      >
        <span v-show="!loading">
          <Option v-for="op in options" :key="op[0]" :value="op[0]">{{
            op[1]
          }}</Option>
          <div v-show="options.length === 0">{{ '无...' }}</div>

          <a
            v-if="showSearchMore"
            href="javascript:void(0)"
            name=""
            @click="searchMore"
            >{{ '搜索更多...' }}</a
          >
        </span>
      </SelectM2o>

      <div>&nbsp;</div>
    </div>
  </div>
</template>

<script>
import SelectM2o from '@/components/iview/SelectM2o'

import { sleep } from '@/utils'

export default {
  name: 'Home',
  components: { SelectM2o },
  mixins: [],

  data() {
    return {
      value: 0,
      label: '',

      showSearchMore: false,
      options: [],

      loading: false,

      // next fro debug

      list2: [
        [1, '1北京'],
        [2, '2上海'],
        [3, '3深圳'],
        [4, '4杭州'],
        [5, '5广州'],
        [6, '6北京'],
        [7, '7上海'],
        [8, '8深圳'],
        [9, '9杭州'],
        [10, '10广州'],
        [11, '11北京'],
        [12, '12上海'],
        [13, '13深圳'],
        [14, '14杭州'],
        [15, '15广州'],
        [16, '16北京'],
        [17, '17上海'],
        [18, '18深圳'],
        [19, '19杭州']
      ]
    }
  },
  computed: {
    // options_default() {
    //   return this.list2.filter(item => item[0] === this.value)
    // },

    // option_default() {
    //   const options_default = this.options_default
    //   if (options_default.length) {
    //     const op = options_default[0]
    //     return op
    //   } else {
    //     return [null, null]
    //   }
    // },

    // defaultValue() {
    //   const op = this.option_default
    //   return op[0]
    // },

    // defaultLabel() {
    //   const op = this.option_default
    //   return op[1]
    // },

    // options2() {
    //   if (this.options.length === 0) {
    //     return this.options_default
    //   }
    //   return this.options
    // },

    value2: {
      get() {
        return this.value || 0
      },
      set(value) {
        this.value = value
      }
    }
  },
  async created() {
    this.init()
  },

  methods: {
    async init() {
      this.value = 12
      this.label = '12上海'
    },

    async _getSelectOptions(query) {
      // console.log('_getSelectOptions, ', query)

      const res1 = query
        ? this.list2.filter(item => item[1].search(query) >= 0)
        : this.list2

      const options = res1.slice(0, 8)
      await sleep(1000)

      const options1 = options.slice(0, 7)
      const show_search_more = options.length > options1.length
      this.showSearchMore = show_search_more

      return options1
    },

    async remoteMethod(query) {
      this.loading = true

      // console.log('remoteMethod', JSON.stringify(query))
      const options = await this._getSelectOptions(query)
      this.options = [...options]
      this.loading = false
    },

    async searchMore() {
      console.log('searchMore')
    }
  }
}
</script>

<style type="text/css"></style>
