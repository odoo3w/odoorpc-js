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

class Parent {
  constructor() {
    this.a = 'parent a'
  }
  fn1() {
    console.log('Parent fn1')
  }

  fn() {
    this.fn1()
    console.log('Parent fn')
    console.log('Parent fn, this.b', this.b)
  }
}

class Child extends Parent {
  constructor() {
    super()
    this.b = 'child b'
  }
  fn1() {
    console.log('CHild fn1')
  }
  fn() {
    super.fn()
    console.log('Child')
  }
}

export default {
  name: 'App',
  components: {
    // HelloWorld
  },

  async created() {
    await odoo.login({ db: 'T2', login: 'admin', password: '123456' })
    await this.test_so()
  },
  methods: {
    //
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
