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
    //
  },

  methods: {
    async page_next() {
      //
    },

    async testSO() {
      //
      // this.dataList = []
      const SO = api.env.model('res.partner')
      const ids = await SO.search([])
      const so = await SO.browse(ids)
      console.log('next:', so)

      // const rec = so.toObject()
      // console.log(rec)
      // this.dataDict = rec
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
