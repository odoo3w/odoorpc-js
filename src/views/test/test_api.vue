<template>
  <div>
    <div>
      <div>&nbsp;</div>
      <div>&nbsp;</div>

      <!-- home 222222 -->
      <div>Test page</div>

      <button type="info" @click="toHome">
        goto home
      </button>

      <div>
        //
      </div>

      <div>&nbsp;</div>
    </div>
  </div>
</template>

<script>
import { test_api } from '@/api'

export default {
  name: 'Home',
  components: {},
  mixins: [],

  data() {
    return {
      dataList: []
    }
  },
  computed: {},
  async created() {
    await this.test()
  },

  methods: {
    async test() {
      await test_api()
      // await get_sportType()
    },

    toHome() {
      this.$router.replace({
        path: '/home'
      })
    }
  }
}
</script>

<style type="text/css"></style>
