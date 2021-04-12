<template>
  <div>
    <div>
      <div>&nbsp;</div>
      <div>&nbsp;</div>

      <h1>{{ node.meta.string }}</h1>

      <OViewTree
        :isMain="true"
        :record="record"
        :node="node"
        :editable="false"
        :key="keyIndex"
      />

      <div>&nbsp;</div>
    </div>
  </div>
</template>

<script>
import api from '@/api'

import OViewTree from '@/components/OViewTree'
export default {
  name: 'Home',
  components: { OViewTree },
  mixins: [],

  data() {
    return {
      api,
      dataList: [],
      keyIndex: 0,
      node: {
        children: [],
        meta: {}
      },
      record: {}
    }
  },
  computed: {},
  async created() {
    await this.init()
  },

  methods: {
    async init() {
      const query = this.$route.query
      // console.log(query)
      const model = query.model
      const views = JSON.parse(query.views)
      const view_type = 'tree'
      const view_ref = views[view_type].view_ref

      const Model = api.env.model(model, view_type, view_ref)
      // console.log([Model])

      const domain = []

      const records = await Model.pageSearch(domain, { order: 'id' })
      // console.log(records)
      const page0 = await records.pageGoto(0)
      const data = page0.fetch_all()
      // console.log(page0)
      this.record = page0

      this.dataList = data

      // console.log('view _view_info,', page0._view_info)

      const node = page0.view_node()
      // console.log('view node,', node)
      this.node = node

      this.keyIndex = this.keyIndex + 1
    },

    async init_test() {
      const model_name = 'sale.order'
      const SO = api.env.model(model_name)
      console.log(SO)
    },

    async page_next() {
      //
    }
  }
}
</script>

<style type="text/css"></style>
