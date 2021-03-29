<template>
  <div>
    <div>
      <div>&nbsp;</div>
      <div>Form Page</div>

      <van-button @click="toHome">
        goto home
      </van-button>
      <div>id: {{ dataDict.id }}</div>

      <div>name: {{ dataDict.name }}</div>
      <div>note: {{ dataDict.note || JSON.stringify(dataDict.note) }}</div>
      <div>line:{{ dataDict.order_line }}</div>
      <div>partner:{{ dataDict.partner_id }}</div>
      <div>partner:{{ dataDict.partner_id__name }}</div>
      <div>amount:{{ dataDict.amount_total }}</div>
      <div>shiper:{{ dataDict.partner_shipping_id__name }}</div>
      <div>pricelist:{{ dataDict.pricelist_id__name }}</div>

      <van-button @click="clicktest">
        test
      </van-button>

      <div>line</div>
      <div>
        <div v-for="line in dataDict.order_line__record || []" :key="line.id">
          id: {{ line.id }}, name: {{ line.name }}, price:
          {{ line.price_unit }}, prodcut: {{ line.product_id }},
          {{ line.product_id__name }}, qty:
          {{ line.product_uom_qty }}
          , total: {{ line.price_subtotal }}
        </div>
      </div>

      <!-- <div>{{ dataDict.order_line__record }}</div> -->

      <div>
        <div v-for="(index, col) in dataDict" :key="col">
          {{ col }}: {{ dataDict[col] }} : {{ typeof dataDict[col] }}
        </div>
      </div>

      <div>&nbsp;</div>
    </div>
  </div>
</template>

<script>
import api from '@/api'
import { sleep } from '@/odoojs/utils'

const Timeout = 500

export default {
  name: 'Home',
  components: {},
  mixins: [],

  data() {
    return {
      modelName: 'sale.order',
      dataDict: {},
      record: {},
      selections: {},
      readonlys: {},
    }
  },
  computed: {},
  async created() {
    const xml_id = 'sale.view_order_form'
    const Model = api.env.model(this.modelName, 'form')
    const so = Model.search([])

    // const Model2 = api.env.model(this.modelName)
  },

  methods: {
    toHome() {
      this.$router.replace({
        path: '/home',
      })
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
      const view_form_xml_id = 'sale.view_order_form'
      const Model = api.env.model(this.modelName)
      const callback = (res) => {
        this.dataDict = { ...this.dataDict, ...res }
      }
      const record = await Model.browse(null, {
        view_form_xml_id,
        fetch_one: callback,
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
      const view_form_xml_id = 'sale.view_order_form'
      const Model = api.env.model(this.modelName)
      const ids = await Model.search([], { order: 'id' })
      // const record = await Model.browse(ids)
      const records = await Model.browse(ids, {
        view_form_xml_id,
        // fetch_one: callback //  只返回 第一个 id 的 dict
        // fetch_all: callback_all // 返回所有的 ids 的 list值
      })

      const callback = (res) => {
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
    },

    async submit() {
      const record = this.record
      await record.commit()
      // record.$order_line
    },
  },
}
</script>

<style type="text/css"></style>
