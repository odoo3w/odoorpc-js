<template>
  <div>
    <div>
      <OViewForm :record="record" :node="node" editable />

      <div>&nbsp;-----version-----</div>
      <div>{{ api.version }}</div>

      <div>&nbsp;</div>
      <div>&nbsp;</div>

      <button type="info" @click="toHome">goto home</button>
      <button type="info" @click="submit">submit</button>

      <div>&nbsp;</div>

      <div>&nbsp;</div>
    </div>
  </div>
</template>

<script>
import api from '@/api'
import OViewForm from '@/components/OViewForm'

import { sleep } from '@/odoojs/utils'

const Timeout = 500

export default {
  name: 'FormPage',
  components: { OViewForm },
  mixins: [],

  data() {
    return {
      api,
      record: null,
      node: {}
    }
  },
  computed: {},
  async created() {
    // await this.init_data_so()
    // await this.init_data_ptn_title()
    await this.init_data_ptn()
    // await this.init_data_user()
    await this.renderMe()

    // this.record.$login = 'u1234567'
    // this.record.$name = 'u1234567'
    // await this.record.awaiter
    // this.record.commit()
  },

  methods: {
    toHome() {
      this.$router.replace({ path: '/home' })
    },

    async submit() {
      const record = this.record
      console.log('submit')
      await record.commit()
      console.log('submit ok')
      // record.$order_line
    },

    async renderMe() {
      const node = this.record.view_node()
      // console.log('view node,', node)
      this.node = node
    },

    async init_data_user() {
      // const model_name = 'res.partner'
      const model_name = 'res.users'
      // const view_ref = 'base.view_users_form'
      const view_ref = null
      const domain = []
      // const domain = []
      await this.init_data({ model_name, view_ref, domain })
    },

    async init_data_ptn() {
      const model_name = 'res.partner'
      const view_ref = null
      const domain = [['id', '=', '3']]
      // const domain = []
      await this.init_data({ model_name, view_ref, domain })
    },

    async init_data_ptn_title() {
      // const model_name = 'res.partner'
      const model_name = 'res.partner.category'
      const view_ref = null
      const domain = [['parent_id.name', '=', 'test222']]
      // const domain = []
      await this.init_data({ model_name, view_ref, domain })
    },

    async init_data({ model_name, view_ref, domain }) {
      const view_type = 'form'
      const SO = api.env.model(model_name, view_type, view_ref)
      let ids = await SO.search(domain, { order: 'id' })

      let ids2 = ids

      if (!ids.length) {
        ids2 = null
      }

      const so = await SO.browse(ids2)

      // console.log(so)
      this.record = so

      // const dd = so.fetch_all()

      // console.log('form, record', this.record)
    },

    async form_edit() {
      // edit
      // await this.init_browse()
      // await this.init_selections()
      // await this.editSO()
      // await sleep(Timeout)
      // await this.readLines()
      // await sleep(Timeout)
      // // await this.writeLines()
      // // await sleep(Timeout)
      // await sleep(Timeout)
      // await this.newLine()
      // await sleep(Timeout)
      // await this.delLine()
    },

    async form_new() {
      // await this.init_new()
      // await this.edit_new()
      // await sleep(Timeout)
      // await this.newLine()
      // await sleep(Timeout)
      // await this.newLine()
      // await sleep(Timeout)
      // await this.delLine(1)
      // // await sleep(Timeout)
      // await this.delLine()
      // // await sleep(Timeout)
      // // this.init_readonly()
    },

    async clicktest() {
      // this.newLine()
      // await this.delLine(1)
      this.submit()
    },

    async init_new() {
      const view_ref = 'sale.view_order_form'
      const Model = api.env.model(this.modelName)
      const callback = res => {
        this.dataDict = { ...this.dataDict, ...res }
      }
      const record = await Model.browse(null, {
        view_ref,
        fetch_one: callback
      })

      this.record = record
    },

    async edit_new() {
      const record = this.record
      record.$note = '1233'
      await sleep(Timeout)
      record.$partner_id = 3
      // console.log(record._values_to_write)
    },

    async init_browse() {
      const view_ref = 'sale.view_order_form'
      const Model = api.env.model(this.modelName)
      const ids = await Model.search([], { order: 'id' })
      // const record = await Model.browse(ids)
      const records = await Model.browse(ids, {
        view_ref
        // fetch_one: callback //  只返回 第一个 id 的 dict
        // fetch_all: callback_all // 返回所有的 ids 的 list值
      })

      const callback = res => {
        this.dataDict = { ...res }
      }

      const record = records.getByIndex(0, { fetch_one: callback }) // 这里应该定义自己的 callback

      this.record = record
    },

    async init_selections() {
      const record = this.record
      const fields = ['partner_id', 'state']
      const selections = await record.get_selection({ fields })
      this.selections = { ...this.selections, ...selections }
    },

    async editSO() {
      const record = this.record
      record.$note = '1233'
      await sleep(Timeout)
      record.$partner_id = 3
    },

    async readLines() {
      const record = this.record
      console.log('readLines 1 ')
      const lines = await record.$order_line
      console.log('readLines 2 ', lines)
    },

    async init_readonly() {
      const record = this.record
      const readonlys = await record.get_readonlys()
      this.readonlys = readonlys

      console.log('readonly', readonlys)
    },

    async writeLines() {
      const record = this.record
      const lines = await record.$order_line
      const line1 = lines.getByIndex(0)
      console.log(line1)

      line1.$price_unit = 11.1

      // const fields = ['product_id', 'product_uom']
      // const selections = await line1.get_selection({ fields })
      // console.log('wr line', selections)
      // this.selections = { ...this.selections, ...selections }
    },

    async newLine() {
      const record = this.record
      const lines = await record.$order_line
      console.log('new line 1', lines.ids)
      const line1 = await lines.new()
      console.log('new line 2', lines.ids)
      console.log(line1)

      const fields = ['product_id', 'product_uom']
      const selections = await line1.get_selection({ fields })
      console.log('sol new , selections', selections)
      await sleep(Timeout)

      // console.log('set product id = 1, xxxxxxxxxxx')
      line1.$product_id = 1
      await line1.awaiter
      const selections2 = await line1.get_selection({ fields })
      console.log('sol new , selections', selections2)

      // await sleep(Timeout)
      line1.$product_uom_qty = 10

      // line1.$price_unit = 11.9
    },

    async delLine(seq) {
      const record = this.record
      const lines = await record.$order_line
      if (seq) {
        const line = lines.getByIndex(-1)
        await lines.remove(line)
      } else {
        const line = lines.getByIndex(0)
        await lines.remove(line)
      }

      // record.$order_line
    }
  }
}
</script>

<style type="text/css"></style>
