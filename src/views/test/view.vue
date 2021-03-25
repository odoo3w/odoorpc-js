<template>
  <div>
    <div>
      <FormView :record="record" :key="viewIndex" readonly />

      <div>&nbsp;-----version-----</div>
      <div class="oe_chatter">{{ api.version }}</div>

      <div>&nbsp;</div>
      <div>&nbsp;</div>

      <van-button type="info" @click="toHome"> goto home </van-button>

      <!-- <div>
        {{ dataDict }}
        <div v-for="(index, col) in dataDict" :key="col">
          {{ col }}: {{ dataDict[col] }}
        </div>
      </div> -->

      <div>&nbsp;</div>
    </div>
  </div>
</template>

<script>
import api from '@/api'

import FormView from '@/components/FormView.js'

export default {
  name: 'Home',
  components: { FormView },
  mixins: [],

  data() {
    return {
      api,
      viewIndex: 1,
      record: null,
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

    await this.init_data_so()
    // await this.init_data_ptn_title()
    // await this.init_data_ptn()
  },

  methods: {
    async init_data_so() {
      const model_name = 'sale.order'
      const view_ref = 'sale.view_order_form'
      const domain = []
      this.init_data({ model_name, view_ref, domain })
    },

    async init_data_ptn_title() {
      // const model_name = 'res.partner'
      const model_name = 'res.partner.title'
      const view_ref = null
      const domain = []
      this.init_data({ model_name, view_ref, domain })
    },

    async init_data_ptn() {
      const model_name = 'res.partner'
      // const model_name = 'res.partner.title'
      const view_ref = null
      const domain = [['id', 'in', [3]]]
      this.init_data({ model_name, view_ref, domain })
    },

    async init_data({ model_name, view_ref, domain }) {
      const view_type = 'form'
      const SO = api.env.model(model_name, view_type, view_ref)
      let ids = await SO.search(domain, { order: 'id' })
      const so = await SO.browse(ids[0])

      this.record = so
      this.viewIndex = this.viewIndex + 1
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
