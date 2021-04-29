<template>
  <div>
    <h1>{{ node.attrs.string }}</h1>

    <Divider />
    <span v-if="['tree', 'kanban'].includes(view_type)">
      <Button type="primary" @click="handleOnCreate">创建</Button>
      <Button @click="handleOnImport">导入</Button>
    </span>
    <span v-if="['form'].includes(view_type)">
      <Button type="primary" @click="handleOnEdit">编辑</Button>
      <Button @click="handleOnCreate">创建</Button>
    </span>
    <Button type="primary" @click="handleOnCommit">保存</Button>

    <Divider />
    <OView
      :record="record"
      :dataDict="dataDict"
      :view_type="view_type"
      :editable="editable"
      :key="keyIndex"
      @on-row-click="handleOnRowClick"
    />
  </div>
</template>

<script>
import api from '@/api'
import OView from '@/components/OView'

const WEB_PATH = '/web'

export default {
  name: 'Home',
  components: { OView },
  mixins: [],

  data() {
    return {
      api,
      editable: false,
      view_type: null,
      keyIndex: 0,
      node: {
        children: [],
        attrs: {}
      },
      record: {},
      dataDict: {}
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

    // console.log(' sessioin :', api.allowed_company_ids)
    // allowed_company_ids
  },

  async mounted() {
    //
  },

  methods: {
    async init() {
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
        const node = page0.view_node()
        this.node = node
        this.view_type = view_type
        this.record = page0
      }

      const kanban_init = async () => {
        const domain = []
        const records = await Model.pageSearch(domain, { order: 'id' })
        const page0 = await records.pageGoto(0)
        const node = page0.view_node()
        this.node = node

        this.view_type = view_type
        this.record = page0
      }

      const form_init = async () => {
        const rid = Number(query.id)
        // const deep_copy = node => {
        //   return JSON.parse(JSON.stringify(node))
        // }

        const callback = (res /*field*/) => {
          // console.log('web callback,', field, deep_copy(res))
          // console.log('web callback,', field, this.record)
          this.dataDict = { ...res }

          // console.log('web, xxxxxx:', deep_copy(this.dataDict))
        }

        const record = await Model.browse(rid, { fetch_one: callback })

        console.log('web, record,xxxxxx:', record)

        const node = record.view_node()
        this.node = node
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

    handleOnRowClick(row) {
      const query = this.$route.query
      const view_type = 'form'
      this.$router.push({
        path: WEB_PATH,
        query: { ...query, view_type, id: row.id }
      })
    },

    handleOnCreate() {
      console.log(' handleOnCreate ')
    },

    handleOnEdit() {
      console.log(' handleOnEdit ')
      this.editable = true
      this.keyIndex = this.keyIndex + 1
    },

    async handleOnCommit() {
      console.log(' handleOnCommit ')
      await this.record.commit()
      this.editable = false
      this.keyIndex = this.keyIndex + 1
    },

    handleOnImport() {
      //

      console.log(' handleOnImport ')
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
