<template>
  <div>
    <div>
      <div>&nbsp;</div>
      <div>&nbsp;</div>

      <!-- home 222222 -->
      <div>Home page</div>

      <div>{{ api.version }}</div>

      <div>
        {{ image }}
      </div>
      <div>
        <img :src="image" alt="" />
      </div>
      <button @click="toTest">
        test
      </button>

      <button @click="toTestApi">
        test Api
      </button>

      <button @click="toTestSelect">
        test Select
      </button>
      <button @click="toTestSelect2">
        test toTestSelect2
      </button>
      <button @click="toTestForm">
        test form
      </button>

      <button @click="logout">
        注销
      </button>

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
      image: ''
    }
  },
  computed: {},
  async created() {},

  methods: {
    //

    async logout() {
      //
      console.log(' logout')
      await api.logout()
      this.$router.replace({
        path: '/user/login'
      })
    },

    toTest() {
      this.$router.replace({ path: '/test' })
    },
    toTestApi() {
      this.$router.replace({ path: '/test/api2' })
    },

    toTestSelect() {
      this.$router.replace({ path: '/test/select' })
    },

    toTestSelect2() {
      this.$router.replace({ path: '/test/select2' })
    },

    toTestForm() {
      this.$router.replace({ path: '/test/form' })
    }
  }
}
</script>

<style type="text/css"></style>
