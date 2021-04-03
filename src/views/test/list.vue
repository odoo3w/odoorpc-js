<template>
  <div>
    <div>
      <div>&nbsp;</div>
      <div>&nbsp;</div>

      <!-- home 222222 -->
      <div>Test page</div>

      <div>{{ api.version }}</div>

      <button type="info" @click="toHome">
        goto home
      </button>

      <!-- <div v-if="viewInfo.arch.tagName === 'tree'">
        -------
        <TreeView :viewInfo="viewInfo" :dataList="dataList" />
      </div> -->

      <!-- <div>
        <div v-for="rec in dataList" :key="rec.id">
          {{ rec.id }} -- {{ rec.partner_id__name }} -- {{ rec.name }}
        </div>
      </div> -->

      <div>&nbsp;</div>
    </div>
  </div>
</template>

<script>
import api from '@/api'

import TreeView from '@/components/TreeView'

export default {
  name: 'Home',
  components: { TreeView },
  mixins: [],

  data() {
    return {
      api,
      dataList: [],
      viewInfo: { arch: { tagName: '' } },
    }
  },
  computed: {},
  async created() {
    await this.init()
  },

  methods: {
    async init() {
      // await this.init_data()
      await this.init_test()
    },

    async init_test() {
      const model_name = 'sale.order'
      const SO = api.env.model(model_name)
      console.log(SO)
    },

    async init_data() {
      const model_name = 'sale.order'
      // const view_type = 'form'
      // const view_ref = 'sale.view_order_tree'
      // // const view_ref = "sale.view_quotation_tree_with_onboarding";
      // const SO = api.env.model(model_name, view_type, view_ref)
      // const viewInfo = await SO.view_info2()
      // this.viewInfo = { ...viewInfo }
      // console.log(viewInfo)
      // const domain = []
      // let sos = await SO.pageSearch(domain, { order: 'id' })
      // console.log('next:', sos.totalIds, sos.count, sos.pageCount)
      // const so = await sos.pageGoto(0)
      // const data = so.fetch_all()
      // // const data = so && so.toArray()
      // console.log(data)
      // this.dataList = [...data]
    },

    async page_next() {
      //
    },

    async testSO() {
      //
      this.dataList = []

      const so = await sos.pageGoto(0)
      const data = so && so.toArray()
      // console.log(data)
    },

    toHome() {
      this.$router.replace({
        path: '/home',
      })
    },
  },
}
</script>

<style type="text/css"></style>
