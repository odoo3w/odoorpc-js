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

      <van-button @click="toTestList">
        test list
      </van-button>
      <van-button @click="toTestView">
        test view
      </van-button>
      <van-button @click="toTestForm">
        test form
      </van-button>

      <van-button @click="logout">
        注销
      </van-button>

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
  async created() {
    //
    // NewClass.search_code()
    // NewClass.search()
  },

  methods: {
    async logout() {
      //
      console.log(' logout')
      await api.logout()
      this.$router.replace({
        path: '/user/login'
      })
    },

    toTestList() {
      this.$router.replace({
        path: '/test/list'
      })
    },

    toTestView() {
      this.$router.replace({
        path: '/test/view'
      })
    },

    toTestForm() {
      this.$router.replace({
        path: '/test/form'
      })
    }
  }
}
</script>

<style type="text/css"></style>
