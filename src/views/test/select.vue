<template>
  <div>
    <div>
      <div>&nbsp;</div>

      <div>currentValue: {{ value }}</div>
      <!-- {{ options }}
      {{ showSearchMore }} -->
      <Divider />

      <button @click="onSet">set</button>

      <Divider />
      <!-- auto-complete -->

      <div v-if="options.length > 6">more</div>

      <Select
        v-else
        v-model="value2"
        filterable
        multiple
        placeholder="input here"
        style="width:200px"
      >
        <Option v-for="op in options" :key="op[0]" :value="op[0]">{{
          op[1]
        }}</Option>

        <Option :value="0" @click.native="searchMore">
          <div>{{ '搜索更多' }}</div>
        </Option>
      </Select>

      <div>&nbsp;</div>
    </div>
  </div>
</template>

<script>
// import OSelect from '@/components/iview/OSelect'

// import { sleep } from '@/utils'

export default {
  name: 'Home',
  // components: { OSelect },
  mixins: [],

  data() {
    return {
      value: 0,

      label: '',
      placeholder: 'pls input',

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
    async onSet() {
      if (this.showSearchMore) {
        this.options = this.list2
      } else {
        this.options = await this._getSelectOptions()
      }
      this.showSearchMore = !this.showSearchMore
    },

    async init() {
      this.value = 12
      this.label = '12上海'
      this.options = await this._getSelectOptions()

      console.log(this)
    },

    async _getSelectOptions(query) {
      // console.log('_getSelectOptions, ', query)

      const res1 = query
        ? this.list2.filter(item => item[1].search(query) >= 0)
        : this.list2

      const options = res1.slice(0, 8)
      // await sleep(1000)

      const options1 = options.slice(0, 3)
      // const show_search_more = options.length > options1.length
      // this.showSearchMore = show_search_more

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
