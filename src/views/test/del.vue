<template>
  <div>
    <div>
      <div>&nbsp;</div>
      <div>&nbsp;</div>

      <!-- home 222222 -->
      <div>Test page</div>

      <div>{{ api.version }}</div>

      <button type="info" @click="toHome">
        goto home
      </button>
      <button type="info" @click="testSO">
        read SO
      </button>

      <div>
        <!-- {{ dataList }} -->
        <div v-for="rec in dataList" :key="rec.id">
          {{
            rec.then((r) => {
              r.ids
            })
          }}
          <!-- {{ rec.model }} {{ rec.name }} -->
        </div>
      </div>

      <div>&nbsp;</div>
    </div>
  </div>
</template>

<script>
import api from '@/api'

export default {
  name: 'Home',
  components: {},
  mixins: [],

  data() {
    return {
      api,
      dataList: [],
    }
  },
  computed: {},
  async created() {
    //
  },

  methods: {
    async page_next() {
      //
    },

    async testSO() {
      //
      // this.dataList = []
      const SO = api.env.model('ir.model.fields')

      // let sos = await SO.pageSearch(domain, { order: 'id' })
      // console.log('next:', sos.totalIds, sos.count, sos.pageCount)
      // const so = await sos.pageGoto(0)
      // const data = so && so.toArray()
      // console.log(data)

      // const rec = so && so.toObject()
      // console.log(rec)
    },

    toHome() {
      this.$router.replace({
        path: '/home',
      })
    },
  },
}
</script>

<style type="text/css"></style>
