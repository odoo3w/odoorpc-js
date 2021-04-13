<template>
  <div>
    <Divider />
    <!-- clearable -->
    <!-- -->
    <Select
      v-model="value"
      ref="select"
      filterable
      :default-label="defaultLabel"
      :remote-method="remoteMethod3"
      :loading="loading3"
      style="width:200px"
      @on-open-change="handleOnOpenChange"
    >
      <Option
        v-for="(option, index) in options3"
        :value="option.id"
        :key="index"
        >{{ option.display_name }}</Option
      >
    </Select>
    <Divider />

    <div>
      <div>&nbsp;</div>
      <div>&nbsp;</div>

      <!-- home 222222 -->
      <div>Home page</div>

      <button @click="logout">
        注销
      </button>

      <div>&nbsp;</div>
    </div>
  </div>
</template>

<script>
import api from '@/api'

import { sleep } from '@/utils'
export default {
  name: 'Home',
  components: {},
  mixins: [],

  data() {
    return {
      api,
      image: '',

      value: 0,
      options3: [],
      loading3: false,
      options_default: [],

      init_finished: false,

      list2: [
        { id: 1, display_name: '北京' },
        { id: 2, display_name: '上海' },
        { id: 3, display_name: '深圳' },
        { id: 4, display_name: '杭州' },
        { id: 5, display_name: '广州' }
      ]
    }
  },
  computed: {
    defaultLabel() {
      const dfts = this.options_default.filter(item => item.id === this.value)
      return dfts[0].display_name
    }
  },
  async created() {
    this.options_default = [{ id: 2, display_name: '上海' }]
    this.value = 2
  },

  methods: {
    async _get_selection(query) {
      return [...this.list2]
    },

    async get_selection(query) {
      console.log('get_selection', JSON.stringify(query))
      if (query === undefined) {
        console.log('get_selection 2', JSON.stringify(query))
        const options = await this._get_selection('')
        await sleep(1000)
        this.options3 = [...options]
      }
    },

    async remoteMethod3(query) {
      console.log('remoteMethod3', JSON.stringify(query))
      this.loading3 = true
      await this.get_selection()

      if (!this.init_finished) {
        setTimeout(() => {
          this.init_finish()
          this.init_finished = true
        }, 1)
      }

      this.loading3 = false
    },

    //

    init_finish() {
      console.log('initFinish   ', this.value, this.defaultLabel)

      const option = {
        value: this.value,
        label: this.defaultLabel,
        tag: undefined
      }

      this.$refs.select.onOptionClick(option)
    },

    async handleOnOpenChange(open) {
      console.log('handleOnOpenChange', open, JSON.stringify(this.model19))
      if (open) {
        // this.$refs.select.setQuery('')
        // this.remoteMethod3()
        // console.log('handleOnOpenChange 2', res)
      }
      // await this.get_selection()
      // // this.toFlash()
      // console.log('handleOnOpenChange 2', this.options)
    },
    handleOnChange() {
      console.log('handleOnChange', JSON.stringify(this.model11))
    },

    handleOnClear() {
      console.log('handleOnClear', JSON.stringify(this.model11))
    },

    handleOnQueryChange(query) {
      //
      console.log('handleOnQueryChange', JSON.stringify(query))
    },

    //

    async logout() {
      //
      console.log(' logout')
      await api.logout()
      this.$router.replace({
        path: '/user/login'
      })
    },

    toTestApi() {
      this.$router.replace({ path: '/test/api2' })
    },

    toTestView() {
      this.$router.replace({ path: '/test/view' })
    },

    toTestForm() {
      this.$router.replace({ path: '/test/form' })
    }
  }
}
</script>

<style type="text/css"></style>
