<template>
  <div>
    <van-nav-bar :title="WEBNAME" />

    <div>&nbsp;</div>
    <div>&nbsp;</div>

    <van-tabs v-model="active">
      <van-tab title="密码登录"><login-form /></van-tab>
      <!-- <van-tab title="验证码登录"><email-login-form /></van-tab> -->
    </van-tabs>
    <!-- <van-row gutter="16">
      <van-col span="8" offset="4">
        <a href="javascript:;" @click="routerResetPsw">忘记密码</a>
      </van-col>
      <van-col span="8">
        <a href="javascript:;" @click="routerRegister">注册</a>
      </van-col>
    </van-row> -->
  </div>
</template>

<script>
import LoginForm from './login-form'
// import EmailLoginForm from './email-login-form'

export default {
  name: 'AppLogin',
  components: {
    LoginForm
    //  EmailLoginForm
  },

  data() {
    return {
      WEBNAME: '管理系统',
      active: 0
    }
  },
  computed: {
    //
  },
  async created() {
    // console.log('ssss,ss login app')
  },

  methods: {
    async routerRegister() {
      return this.$router.replace({ path: '/user/register' })
    },
    async routerResetPsw() {
      return this.$router.replace({ path: '/user/resetpsw' })
    }
  }
}
</script>

<style type="text/css"></style>
