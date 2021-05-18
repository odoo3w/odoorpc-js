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

      <button type="info" @click="toTest">
        run
      </button>

      <Upload :before-upload="handleUpload" action="">
        <Button>sssss</Button>
      </Upload>

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
  async created() {},

  methods: {
    async toTest() {
      await test_api()
    },

    toHome() {
      this.$router.replace({
        path: '/home'
      })
    },

    async handleUpload(file) {
      // this.file = file

      console.log('handleUpload', file)

      // this.setBtn('open')
      // await sleep(1000)
      // this.$emit('onloadend', { file })
    }
  }
}
</script>

<style type="text/css"></style>
