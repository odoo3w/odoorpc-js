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
        <div v-for="rec in dataList" :key="rec.id">
          <!-- {{ rec.name }} -->
          {{ rec.id }} -- {{ rec.partner_id__name }} -- {{ rec.name }}
        </div>
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
      dataList: []
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
      this.dataList = []
      const SO = api.env.model('sale.order')

      const domain = []

      let sos = await SO.pageSearch(domain, { order: 'id' })
      console.log('next:', sos.totalIds, sos.count, sos.pageCount)

      const so = await sos.pageGoto(0)
      const data = so && so.toArray()
      // console.log(data)

      this.dataList = data
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
