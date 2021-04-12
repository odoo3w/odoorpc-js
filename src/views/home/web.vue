<template>
  <div>
    <h1>{{ node.meta.string }}</h1>

    <OView
      :isMain="true"
      :record="record"
      :view_type="view_type"
      :node="node"
      :editable="false"
      :key="keyIndex"
    />
  </div>
</template>

<script>
import api from '@/api'
import OView from '@/components/OView'

export default {
  name: 'Home',
  components: { OView },
  mixins: [],

  data() {
    return {
      api,
      view_type: null,
      keyIndex: 0,
      node: {
        children: [],
        meta: {}
      },
      record: {}
    }
  },
  computed: {},

  watch: {
    // 菜单切换时, 触发
    '$route.query': {
      handler: function(val) {
        console.log('watch, $route.query, val', val)
        this.init()
      },
      deep: true
    }
  },

  async created() {
    await this.init()
  },

  methods: {
    async init() {
      // const query = {
      //   model: 'sale.order',
      //   view_type: 'tree'
      //   tree_view_ref: 'sale.view_order_tree',
      //   form_view_ref: 'sale.view_order_form',
      // }
      const query = this.$route.query
      console.log('web, init,', query)
      const model = query.model
      const view_type = query.view_type
      const view_ref = query[`${view_type}_view_ref`]

      const Model = api.env.model(model, view_type, view_ref)

      const tree_init = async () => {
        const domain = []
        const records = await Model.pageSearch(domain, { order: 'id' })
        const page0 = await records.pageGoto(0)
        // const node = page0.view_node()
        // this.node = node
        this.view_type = view_type
        this.record = page0
      }

      const kanban_init = async () => {
        const domain = []
        const records = await Model.pageSearch(domain, { order: 'id' })
        const page0 = await records.pageGoto(0)
        // const node = page0.view_node()
        // this.node = node

        this.view_type = view_type
        this.record = page0
      }

      const form_init = async () => {
        const rid = Number(query.id)
        const record = await Model.browse(rid)
        // const node = record.view_node()
        // this.node = node
        this.view_type = view_type
        this.record = record
      }

      if (view_type === 'tree') {
        await tree_init()
      } else if (view_type === 'kanban') {
        await kanban_init()
      } else if (view_type === 'form') {
        await form_init()
      } else {
        //
      }
      this.keyIndex = this.keyIndex + 1
    },

    async page_next() {
      // //
      // // const query = {
      // //   model: 'sale.order',
      // //   view_type: 'tree'
      // //   tree_view_ref: 'sale.view_order_tree',
      // //   form_view_ref: 'sale.view_order_form',
      // // }
      // const query = this.$route.query
      // const model = query.model
      // const view_type = query.view_type
      // const view_ref = query[`${view_type}_view_ref`]
      // // this.$router.push({ path: WEB_PATH, query: action })
    }
  }
}
</script>

<style type="text/css"></style>
