<template>
  <div>
    <van-form @submit="submit">
      <van-field
        v-model="form.username"
        name="username"
        left-icon="user-circle-o"
        label="用户名"
        placeholder="请输入用户名"
        :rules="login_rules.username"
      />

      <!-- <van-icon name="eye-o" /> -->
      <van-field
        v-model="form.password"
        :type="eye_open ? '' : 'password'"
        name="password"
        left-icon="question-o"
        :right-icon="eye_open ? 'eye-o' : 'closed-eye'"
        label="密码"
        placeholder="请输入密码"
        :rules="login_rules.password"
        @click-right-icon="eye_open = !eye_open"
      />
      <div style="margin: 16px;">
        <van-button round block type="info" native-type="submit">
          登录
        </van-button>
        <div>{{ version }}</div>
      </div>
    </van-form>
  </div>
</template>

<script>
import loginMixin from '@/mixins/loginMixin'

export default {
  name: 'LoginForm',
  components: {},
  mixins: [loginMixin],

  props: {},

  data() {
    return {
      //
      eye_open: false
    }
  },

  computed: {
    //
  },

  async created() {},

  methods: {
    submit(/* values */) {
      return this.handleLogin()
    }
  }
}
</script>

<style type="text/css"></style>
