<template>
  <div>
    <div>
      <div>&nbsp;</div>
      <div>Form Page</div>

      <van-button @click="toHome">
        goto home
      </van-button>

      <div>{{ dataDict.name }}</div>
      <div>{{ dataDict.note || JSON.stringify(dataDict.note) }}</div>
      <div>{{ dataDict.order_line }}</div>
      <div>{{ dataDict.partner_id__name }}</div>
      <div>{{ dataDict.amount_total }}</div>
      <div>{{ dataDict.partner_shipping_id__name }}</div>
      <div>{{ dataDict.pricelist_id__name }}</div>

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
      readonlys: {}
    }
  },
  computed: {},
  async created() {
    this.init()
  },

  methods: {
    async init() {
      await this.init_browse()
      await this.init_selections()
      // await sleep(1000)

      // await this.editSO()
      await this.readLines()
      await sleep(1000)
      await this.writeLines()
      await sleep(1000)
      await this.newLine()
      // this.init_readonly()
    },

    async init_browse() {
      const view_form_xml_id = 'sale.view_order_form'
      const Model = api.env.model(this.modelName)
      const ids = await Model.search([], { order: 'id' })
      // const record = await Model.browse(ids)
      const callback = res => {
        this.dataDict = { ...this.dataDict, ...res }
      }
      const records = await Model.browse(ids, {
        view_form_xml_id,
        fetch_one: callback
      })

      const record = records.slice(0, 1)
      // record.fetch_one()

      this.record = record
    },

    async init_selections() {
      const record = this.record
      const fields = ['partner_id', 'state']
      const selections = await record.get_selection({ fields })
      this.selections = { ...this.selections, ...selections }
    },

    async init_readonly() {
      const record = this.record
      const readonlys = await record.get_readonlys()
      this.readonlys = readonlys

      console.log('readonly', readonlys)
    },

    toHome() {
      this.$router.replace({
        path: '/home'
      })
    },
    async editSO() {
      // const record = this.record
      // record.$note = '1233'
      // record.$partner_id = 3
    },

    async readLines() {
      //
      const record = this.record
      const lines = await record.$order_line
      console.log(lines)

      // lines.fetch_all()

      // record.fetch_one()
      //
    },

    async writeLines() {
      const record = this.record
      const lines = await record.$order_line
      const line1 = lines.slice(0, 1)
      console.log(line1)

      line1.$price_unit = 11.9
    },

    async newLine() {
      const record = this.record
      const lines = await record.$order_line
      const line1 = await lines.new()
      console.log(line1)

      await sleep(1000)

      console.log('set product id = 1, xxxxxxxxxxx')
      line1.$product_id = 1

      await sleep(1000)
      line1.$product_uom_qty = 8

      // line1.$price_unit = 11.9
    },

    async submit() {
      const record = this.record
      await record.commit()
      record.$order_line
    },

    clicktest() {
      //
      this.submit()
    }
  }
}
</script>

<style type="text/css"></style>
