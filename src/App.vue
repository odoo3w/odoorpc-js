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
  constructor() {}
}

Parent._odoo = 'parent class odoo'

const new_Child = name => {
  class Child extends Parent {
    constructor() {
      super()
    }
  }

  Child._odoo = `Child class ${name} odoo`

  return Child
}

export default {
  name: 'App',
  components: {
    // HelloWorld
  },

  async created() {
    //
    this.test2()
  },
  methods: {
    //
    async test1() {
      const C1 = new_Child('Ch1')
      console.log(C1._odoo)
    },
    async test2() {
      await odoo.login({ db: 'T2', login: 'admin', password: '123456' })
      const Menu = odoo.env.model('ir.ui.menu')

      // const menu_ids = await Menu.search([['name', '=', 'General Settings']])
      const menu_ids = await Menu.search([['action', '>', 'ir.']])

      console.log(menu_ids)
      const menus = await Menu.browse(menu_ids[0])
      console.log(await menus.$action)

      // const SO = odoo.env.model('res.partner')
      // await Ptn.init()

      // const user = await odoo.env.user

      // const user = await odoo.env.user
      // const companys = await user.$company_ids
      // // console.log(company)
      // expect(companys).to.be.an.instanceof(Model)
      // expect(companys._name).to.be.equal('res.company')
      // const message_follower_ids = await user.$message_follower_ids

      // console.log(user._columns.company_ids)
      // console.log(user._columns.message_follower_ids)

      // console.log(await user.$company_ids)
      // console.log(await user.$message_follower_ids)

      // const SO = odoo.env.model('ir.sequence.date_range')
      // await SO.init()

      // console.log(SO._columns)

      // Object.keys(SO._columns).forEach(item => {
      //   console.log(SO._columns[item])
      //   // if (SO._columns[item].type === 'datetime') {
      //   //   console.log(SO._columns[item])
      //   // }
      // })

      // const so_ids = await SO.search([])

      // const so = await SO.browse(so_ids)
      // console.log(so.id, so.$date_to, so.$date_from)

      // for (const so of sos) {
      //   console.log(so.id, so.$date_to, so.$date_from)
      // }

      // console.log(sos.$validity_date)
      // console.log(sos.$effective_date)
      // console.log(sos.$activity_date_deadline)

      // validity_date
      // effective_date
      // activity_date_deadline

      //
      // const img = user.$login_date
      // console.log(img)
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
