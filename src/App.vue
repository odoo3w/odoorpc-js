<template>
  <div id="app">
    <div>Home:</div>
    <!-- <img alt="Vue logo" src="./assets/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js App" /> -->
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'

import odoo from '@/api'

import { fields_for_test } from '@/odoojs/fields'
import { Model } from '@/odoojs/models'

import { get_cookie } from '@/odoojs/utils'

export default {
  name: 'App',
  components: {
    // HelloWorld
  },

  async created() {
    await odoo.login({ db: 'erpapp', login: 'admin', password: '123456' })
    // console.log(odoo.session_info)
    // const cids = get_cookie('cids')
    // console.log(cids)

    this.test_odoo()

    // this.test_o2m()
    // await this.test_so()
    // this.test_merge()
    // this.test_merge_one()
  },
  methods: {
    async test_odoo() {
      const models = [
        'sale.order',
        'sale.order.line',
        'res.partner',
        'product.product'
      ]

      models.forEach(async item => {
        const SO = odoo.env.model(item)
        console.log(SO)
        const so_ids = await SO.search([])
        const so = await SO.browse(so_ids)
        console.log(so_ids)

        for (const p of so) {
          console.log(p._name, p.id, p.$name)
        }
      })
    },
    //
    async test_o2m() {
      const allowed_company_ids = odoo.allowed_company_ids
      const SO1 = odoo.env.model('sale.order')
      const SO = SO1.with_context({ ...SO1.env.context, allowed_company_ids })

      // console.log(SO.env)

      // // const view_form_xml_id = 'sale_order'
      const view_form_xml_id = 'sale.view_order_form'

      const so_ids = await SO.search([])
      const so = await SO.browse(so_ids, { view_form_xml_id })
      const sols = await so.$order_line
      const sol_new = await sols.new()
      console.log('so.values', so._values.order_line)
      console.log('sols', sols.ids)
      console.log('sol_new', sol_new)
      const prd_selection = await so.get_selection('order_line.product_id')
      console.log('prd_selection', prd_selection)
      console.log('prd_selection', prd_selection[0][0])

      sol_new.$product_id = prd_selection[0][0]

      await sol_new.wait_set()
      await so.commit()
      const sols2 = await so.$order_line
      console.log('sols2', sols2.ids)

      // console.log('so._values.order_line', so._values.order_line)
      // console.log(
      //   'so._values_to_write.order_line',
      //   so._values_to_write.order_line
      // )
    },

    test_merge() {
      const { merge_tuples } = fields_for_test

      const old = [
        [4, 6, 0],
        [4, 7, 0],
        [0, 'v_1', { name: 'n1' }]
      ]
      const tuples = [[0, 'v_1', { name: 'n2' }]]
      const ret = merge_tuples(old, tuples)
      console.log(ret)
    },

    test_merge_one() {
      const { merge_tuples_one } = fields_for_test
      const old = [
        [4, 6, 0],
        [4, 7, 0],
        [0, 'v_1', { name: 'n1' }]
      ]
      const tup = [0, 'v_1', { name: 'n2' }]
      const ret = merge_tuples_one(old, tup)
      console.log(ret)
    },
    test1() {
      //
      const ch = new Child()
      ch.fn()
    },

    async test_so() {
      const SO = odoo.env.model('sale.order')
      // const view_form_xml_id = 'sale_order'
      const view_form_xml_id = 'sale.view_order_form'

      const so_ids = await SO.search([])
      const so = await SO.browse(so_ids, { view_form_xml_id })
      const amount_total = so.$amount_total
      console.log('amount_total1', amount_total)

      const sols = await so.$order_line
      // console.log(sols)
      const sol1 = await sols.new()
      console.log(sol1, sol1.$price_unit)
      const price_subtotal = sol1.$price_subtotal
      console.log('price_subtotal', price_subtotal)
      const prd_selection = await so.get_selection('order_line.product_id')
      console.log('prd_selection', prd_selection)
      const product = await sol1.$product_id

      console.log('product', product.id)

      sol1.$product_id = prd_selection[0][0]
      await sol1.wait_set()
      const product1 = await sol1.$product_id
      console.log('product2', product.id)

      // goto: fields._get_for_onchange

      // const price = sol1.$price_unit
      // sol1.$price_unit = price + 0.1
      // console.log(sol1, sol1.$price_unit)

      // await sol1.wait_set()

      // console.log('price_subtotal', sol1.$price_subtotal)
      // console.log('amount_total2', so.$amount_total)
      // console.log('amount_total2', so._values.amount_total)
      // console.log('amount_total2', so._values_to_write.amount_total)

      // // expect(sol1.$price_subtotal).to.be.not.equal(price_subtotal)
      // // expect(so.$amount_total).to.be.not.equal(amount_total)
      // // const amount_total2 = so.$amount_total
      // await so.commit()

      // console.log('amount_total3', so.$amount_total)
      // console.log('amount_total3', so._values.amount_total)
      // console.log('amount_total3', so._values_to_write.amount_total)

      // expect(so.$amount_total).to.be.equal(amount_total2)
    },

    async test2() {
      const Ptn = odoo.env.model('res.partner')
      const p1 = await Ptn.browse(1)
      const p2 = await Ptn.browse(3)

      const s = Object.is(p1._columns, p2._columns)
      console.log(s)
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
