import api from '@/api'

const Database = process.env.VUE_APP_ODOO_DB

const Mixin = {
  data() {
    let username = ''
    let password = ''
    if (process.env.VUE_APP_BASE_API === '/dev-api') {
      // username = 'user1@comp1'
      username = 'admin'
      password = '123456'
    }

    return {
      version: api.version,
      verifyCode2: '',
      form: {
        username: username,
        password: password,
        password2: password,

        email: username,
        code: ''
      }
    }
  },
  computed: {
    login_rules() {
      return {
        username: [{ required: true, message: '账号不能为空' }],
        password: [{ required: true, message: '密码不能为空' }]
      }
    },

    auth_login_rules() {
      return {
        email: [
          { required: true, message: '邮箱不能为空' },
          {
            message: '账号未注册',
            trigger: 'blur',
            validator: value => this.auth_exist('email', value, 'auth'),
            asyncValidator: (rule, value) =>
              this.auth_exist('email', value, 'auth', 'async')
          }
        ],

        code: [{ required: true, message: '验证码不能为空' }]
      }
    },

    reset_rules() {
      return {
        email: [
          { required: true, message: '邮箱不能为空' },
          {
            message: '账号未注册',
            trigger: 'blur',
            validator: value => this.auth_exist('email', value, 'auth'),
            asyncValidator: (rule, value) =>
              this.auth_exist('email', value, 'auth', 'async')
          }
        ],

        code: [{ required: true, message: '验证码不能为空' }],
        password: [{ required: true, message: '密码不能为空' }],
        password2: [
          { required: true, message: '密码不能为空' },
          {
            message: '两次密码不一致',
            trigger: 'blur',
            validator: value =>
              this.validator_password2(this.form.password, value),
            asyncValidator: (rule, value) =>
              this.validator_password2(this.form.password, value, 'async')
          }
        ]
      }
    },

    reg_rules() {
      return {
        username: [
          { required: true, message: '账号不能为空' },
          {
            message: '账号已经存在',
            trigger: 'blur',
            validator: value => this.auth_exist_not('login', value, 'register'),
            asyncValidator: (rule, value) =>
              this.auth_exist_not('login', value, 'register', 'async')
          }
        ],

        email: [
          { required: true, message: '邮箱不能为空' },
          {
            message: '邮箱已经存在',
            trigger: 'blur',
            validator: value => this.auth_exist_not('email', value, 'register'),
            asyncValidator: (rule, value) =>
              this.auth_exist_not('email', value, 'register', 'async')
          }
        ],

        code: [{ required: true, message: '验证码不能为空' }],

        password: [{ required: true, message: '密码不能为空' }],
        password2: [
          { required: true, message: '密码不能为空' },
          {
            message: '两次密码不一致',
            trigger: 'blur',
            validator: value =>
              this.validator_password2(this.form.password, value),
            asyncValidator: (rule, value) =>
              this.validator_password2(this.form.password, value, 'async')
          }
        ]
      }
    }
  },
  async created() {},

  methods: {
    async handleLogin() {
      await api.login({
        db: Database,
        login: this.form.username,
        password: this.form.password
      })
      this.$router.replace({
        path: '/'
        // query: this.otherQuery
      })

      // return this._handleLogin('user/login', {
      //   username: this.form.username,
      //   password: this.form.password
      // })
    },
    async _handleLogin(action, payload) {
      // const res = this.$store.dispatch(action, payload)
      // res
      //   .then(data => {
      //     const ss = this.$store.state.user
      //     console.log('ssss,ss', data, ss)
      //     // this.$router.replace({
      //     //   path: '/'
      //     //   // query: this.otherQuery
      //     // })
      //   })
      //   .catch(error => {
      //     const ss = this.$store.state.user
      //     console.log('errror,', error, ss)
      //   })
    },

    async routerLogin() {
      console.log('routerLogin')
      return this.$router.replace({ path: '/user/login' })
    },

    async routerRegister() {
      return this.$router.replace({ path: '/user/register' })
    },

    async routerResetPsw() {
      return this.$router.replace({ path: '/user/resetpsw' })
    },

    async _auth_exist(authtype, account, method) {
      const uid = await this.$store.dispatch('user/auth_exist', {
        authtype,
        account,
        method
      })
      return uid ? true : false
    },
    async auth_exist(authtype, account, method, is_async) {
      const res = await this._auth_exist(authtype, account, method)
      return this.validator_return(res, is_async)
    },

    async auth_exist_not(authtype, account, method, is_async) {
      const res = !(await this._auth_exist(authtype, account, method))
      return this.validator_return(res, is_async)
    },

    async validator_password2(password, password2, is_async) {
      const res = password === password2
      return this.validator_return(res, is_async)
    },

    async validator_return(res, is_async) {
      if (is_async) {
        // viewUI call asyncValidator return Promise
        return new Promise((resolve, reject) =>
          res ? resolve(res) : reject(res)
        )
      } else {
        // vantUI call validator  return boolean
        return res
      }
    },

    async _onClickCode(val, { method, done }) {
      if (val) {
        this.verifyCode2 = ''
        return val
      } else {
        this.verifyCode2 = ''
        const res = await this.handleCodesend({ method })
        console.log('auth_codeback code,', res)
        const result = res.result
        const code = result !== undefined ? result : ''
        done(result !== undefined)
        setTimeout(() => {
          this.verifyCode2 = code
        }, 500)

        return val
      }
    },

    async onClickCode_vantUI({ method, done }) {
      const val = await this.$refs.loginForm.validate('email')
      this._onClickCode(val, { method, done })
    },

    async onClickCode_viewUI({ method, done }) {
      this.$refs.loginForm.validateField('email', async val => {
        return this._onClickCode(val, { method, done })
      })
    },

    async handleCodesend({ method }) {
      const payload = {
        authtype: 'email',
        account: this.form.email,
        method
      }
      const res = await this.$store.dispatch('user/auth_codesend', {
        ...payload
      })
      console.log('auth_codesend code,', res)
      return res
      // const code = await this.$store.dispatch('user/auth_codeback', {
      //   ...payload
      // })
      // return [res, code]
    },

    async handleAuthLogin() {
      return this._handleLogin('user/auth_login', {
        authtype: 'email',
        account: this.form.email,
        code: this.form.code
      })
    },

    async handleResetPsw() {
      const res = await this.$store.dispatch('user/auth_resetpsw', {
        authtype: 'email',
        account: this.form.email,
        code: this.form.code,
        password: this.form.password
      })

      if (res) {
        this.$router.replace({
          path: '/user/login'
          // query: this.otherQuery
        })
      }
    },

    async handleRegister(payload = {}) {
      const { done } = payload
      //
      const res = await this.$store.dispatch('user/auth_register', {
        authtype: 'email',
        account: this.form.email,
        code: this.form.code,
        login: this.form.username,
        password: this.form.password
      })

      if (res) {
        if (done) {
          done(res)
        }
        this.$router.replace({
          path: '/user/login'
          // query: this.otherQuery
        })
      }
    }
  }
}

export default Mixin
