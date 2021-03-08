<template>
  <div>
    <div>
      <div>&nbsp;</div>
      <div>&nbsp;</div>

      <!-- home 222222 -->
      <div>Test page</div>

      <div>{{ api.version }}</div>

      <van-button type="info" @click="toHome">
        goto home
      </van-button>
      <van-button type="info" @click="testSO">
        read SO
      </van-button>

      <div>
        <!-- {{ dataList }} -->
        <div v-for="(index, col) in dataDict" :key="col">
          {{ col }}: {{ dataDict[col] }}
        </div>
        <!-- <div>{{ dataDict }}</div> -->
      </div>

      <div>&nbsp;</div>
    </div>
  </div>
</template>

<script>
import api from '@/api'

export default {
  name: 'Home',
  components: {},
  mixins: [],

  data() {
    return {
      api,
      dataDict: {}
    }
  },
  computed: {},
  async created() {
    // let ss = ''
    // ss = ss + '() => {\n'
    // ss = ss + 'const a=11\n'
    // ss = ss + 'const b=12\n'
    // ss = ss + 'const c=13\n'
    // ss = ss + 'return a+ b +c\n'
    // ss = ss + '}'
    // const fn = eval(ss)
    // const ret = fn()
    // console.log(ret)
  },

  methods: {
    async page_next() {
      //
    },

    async testSO() {
      //
      // this.dataList = []
      const SO = api.env.model('sale.order')
      const ids = await SO.search([])
      const so = await SO.browse(ids)
      console.log('next:', so)

      const rec = so.toObject(true)
      console.log(rec)
      this.dataDict = rec

      const selections = await so.get_selections()
      console.log(selections)
    },

    toHome() {
      this.$router.replace({
        path: '/home'
      })
    }
  }
}
</script>

<style type="text/css"></style>
