<template>
  <div>
    <div>
      <div>&nbsp;</div>
      <button type="info" @click="toHome">
        goto home
      </button>

      <div>&nbsp;</div>
      <div>----------</div>
      <div>
        <button @click="dataList = []">clear</button>
      </div>

      <div>----------</div>

      <div>
        <button @click="toSale">销售订单</button>
      </div>

      <div>----------</div>
      <div>
        <button @click="toSale2">销售订单2</button>
      </div>

      <div>----------</div>

      <Table :columns="columns" :data="dataList"> </Table>

      <div>
        //
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
      dataList: [],
      columns: [
        { title: '订单号', key: 'name' },
        { title: '客户', key: 'partner_id' },
        { title: '总金额', key: 'amount_total' },
        { title: '状态', key: 'state' }
      ]
    }
  },
  computed: {},
  async created() {},

  methods: {
    toHome() {
      this.$router.replace({
        path: '/home'
      })
    },

    async toSale() {
      const xml_id = 'sale.action_orders'
      const action_id_respond = await api.json_call('/web/dataset/call_kw', {
        model: 'ir.model.data',
        method: 'xmlid_to_res_model_res_id',
        args: [xml_id, true],
        kwargs: {}
      })
      const action_id = action_id_respond.result[1]

      const action_respond = await api.json_call('/web/action/load', {
        action_id
      })
      const action = action_respond.result
      console.log(action)
      // 获得  action 信息

      const views_respond = await api.json_call('/web/dataset/call_kw', {
        model: action.res_model,
        method: 'load_views',
        args: [],
        kwargs: { views: action.views }
      })
      const views = views_respond.result
      console.log(views)

      const tree_view = views.fields_views.list
      // 获得  tree_view 信息

      const fields = Object.keys(tree_view.fields)
      const tree_data_respond = await api.json_call('/web/dataset/call_kw', {
        model: tree_view.model,
        method: 'search_read',
        args: [],
        kwargs: { fields }
      })

      const tree_data = tree_data_respond.result
      console.log(tree_data)
      // 获得  tree_view data 信息

      this.dataList = [...tree_data]
    },

    async toSale2() {
      const xml_id = 'sale.action_orders'
      // const xml_id = 'purchase.action_orders'

      const action = await api.env.action(xml_id)
      const view = action.get_view('tree')
      // const view = action.get_view('form')
      const records = await view.pageFirst()
      const tree_data = records.fetch_all()

      console.log(tree_data)
      this.dataList = [...tree_data]
    }
  }
}
</script>

<style type="text/css"></style>
