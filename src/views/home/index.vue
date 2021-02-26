<template>
  <div>
    <div>
      <div>&nbsp;</div>
      <div>&nbsp;</div>

      <!-- home 222222 -->

      <div>
        {{ odoo.version }}
      </div>

      <Row>
        <i-col :xs="2" :sm="4" :md="6" :lg="8">.</i-col>
        <i-col :xs="20" :sm="16" :md="12" :lg="8">
          <span> Abcdefgh</span>
        </i-col>
        <i-col :xs="2" :sm="4" :md="6" :lg="8">.</i-col>
      </Row>

      <div>&nbsp;</div>
    </div>
  </div>
</template>

<script>
import odoo from '../../api/index'

class M {
  constructor() {
    this._ids = []
    this.constructor.prototype.__defineGetter__('name', function() {
      return this._ids
    })

    const that = this

    this[Symbol.iterator] = function() {
      let index = 0
      return {
        next() {
          if (index < that._ids.length) {
            const one_record = that.constructor.browse([that._ids[index]])
            // console.log('next,', index, one_record._ids)
            index++
            return { value: one_record, done: false }
          } else {
            return { value: undefined, done: true }
          }
        }
      }
    }
  }

  static browse(ids) {
    const records = new this()
    records._ids = ids
    return records
  }
}

export default {
  name: 'Home',
  components: {},
  mixins: [],

  data() {
    return {
      odoo
    }
  },
  computed: {},
  async created() {
    await odoo.login({ db: 'T2', login: 'admin', password: '123456' })
    console.log(await odoo.version)
    // console.log(odoo.env)
    // console.log('user', await odoo.env.user)

    // await this.test0()
    console.log('+++++++++++++++++++++')
    await this.test1()
    console.log('+++++++++++++++++++++')
  },

  methods: {
    async test0() {
      const mmm = M.browse([11, 22, 33])

      // console.log('mmm', mmm)
      console.log('--1--')
      console.log('pp', mmm.name)
      console.log('--2-')

      const ms = mmm[Symbol.iterator]()
      // console.log('ms', ms)

      const m1 = ms.next().value
      console.log('pp', mmm.name)
      console.log('m1', m1.name)
      const m2 = ms.next().value
      console.log('--3--')
      console.log('pp', mmm.name)
      console.log('m1', m1.name)
      console.log('m2', m2.name)
      console.log('--4--')
      // const m3 = ms.next().value
      // console.log('mmm name', mmm.name)
      // console.log('m2', m2.name)
      // console.log('m3', m3.name)
    },

    async test1() {
      // // console.log(odoo)
      // const Model = odoo.env.model('res.users')

      const Ptn = odoo.env.model('res.partner')
      // console.log('Ptn', Ptn)
      // console.log('Ptn 1', Ptn.env)

      // // // console.log('Ptn env', Ptn.env)
      // // // console.log('Ptn name', Ptn.$name)
      // // // console.log('Ptn company_id', Ptn.$company_id)
      // // // // console.log('Ptn create', Ptn.create)
      // // // // console.log('Ptn browse', Ptn.browse)
      // const ptn_promise = Ptn.browse([1, 2, 3])
      // // console.log('ptn_promise', ptn_promise)
      // const ptn = await ptn_promise

      const ptn = await Ptn._browse(odoo.env, [1, 2, 3])

      console.log('--1--')
      console.log('ptn', ptn._ids, ptn.$name)
      console.log('--2--')

      // for (const p of ptn) {
      //   console.log('p', p._ids, p.$name)
      // }

      const pp = ptn[Symbol.iterator]()
      // // console.log('Ptn ptn', pp)
      const p1 = pp.next().value
      console.log('ptn', ptn._ids, ptn.$name)
      console.log('pp1', p1._ids, p1.$name)
      console.log('--3--')
      const p2 = pp.next().value
      console.log('ptn', ptn._ids, ptn.$name)
      console.log('pp1', p1._ids, p1.$name)
      console.log('pp2', p2._ids, p2.$name)
      console.log('--4--')

      // for ( const p of ptn){

      // }
      // console.log('ptn email:', ptn.$email)
      // console.log('ptn parent_id:', await ptn.$parent_id)
      // console.log('ptn log_ids:', await ptn.$log_ids)
      // console.log('ptn company_id:', await ptn.$company_id)
      // const ss =
      // console.log(' ptn get id2', ss)
      // const name = ptn.name
      // console.log('Ptn name', name)
      // // console.log([Ptn])
      // // console.log(odoo.env._db)
      // // console.log(odoo.env.db)
    }
    //
    // api.login()
  }
}
</script>

<style type="text/css"></style>
