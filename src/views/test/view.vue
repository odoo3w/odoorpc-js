<template>
  <div>
    <div>
      <OContent>
        <FormView :node="node" readonly />
      </OContent>

      <div>&nbsp;-----version-----</div>
      <div class="oe_chatter">{{ api.version }}</div>

      <div>&nbsp;</div>
      <div>&nbsp;</div>

      <button type="info" @click="toHome">goto home</button>

      <div>&nbsp;</div>
    </div>
  </div>
</template>

<script>
import api from '@/api'

import OContent from '@/components/OContent'

import FormView from '@/components/FormView.js'

export default {
  name: 'Home',
  components: { OContent, FormView },
  mixins: [],

  data() {
    return {
      api,

      record: null,
      node: {},
    }
  },
  computed: {},
  async created() {
    // const domain = ['&', true, '|', '!', false, true]
    // const domain = ['&', false, true]
    // const domain = [true]
    // const domain = [true, '!', false, true]
    // const domain = ['!', false]
    // const domain = [true, '!', false]
    // const domain = [10, 20, 30]
    // compute_domain(domain)
    // console.log('xxxx, ')

    // await this.init_data_so()
    // await this.init_data_ptn_title()
    await this.init_data_ptn()

    await this.renderMe()
  },

  methods: {
    async renderMe() {
      //
      const node = this.record.view_node()
      // console.log('view node,', node)
      this.node = node
    },

    async init_data_so() {
      const model_name = 'sale.order'
      const view_ref = 'sale.view_order_form'
      const domain = []
      await this.init_data({ model_name, view_ref, domain })
    },

    async init_data_ptn_title() {
      // const model_name = 'res.partner'
      const model_name = 'res.partner.category'
      const view_ref = null
      const domain = []
      await this.init_data({ model_name, view_ref, domain })
    },

    async init_data_ptn() {
      const model_name = 'res.partner'
      // const model_name = 'res.partner.title'
      const view_ref = null
      const domain = [['id', 'in', [1]]]
      await this.init_data({ model_name, view_ref, domain })
    },

    async init_data({ model_name, view_ref, domain }) {
      const view_type = 'form'
      const SO = api.env.model(model_name, view_type, view_ref)
      let ids = await SO.search(domain, { order: 'id' })
      const so = await SO.browse(ids[0])

      this.record = so
      // this.viewIndex = this.viewIndex + 1
    },

    async page_next() {
      //
    },

    async testSO() {},

    toHome() {
      this.$router.replace({
        path: '/home',
      })
    },
  },
}
</script>

<style type="text/css"></style>
