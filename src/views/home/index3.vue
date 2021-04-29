<template>
  <div>
    <Divider />
    <!-- 
      
      filterable
      clearable
      @on-clear="handleOnClear"
      @on-change="handleOnChange"
      @on-open-change="handleOnOpenChange"
      @on-query-change="handleOnQueryChange"
      
      -->

    <Select
      v-model="model11"
      :remote-method="remoteMethod1"
      :loading="loading1"
      style="width:200px"
      :default-label="defaultLable"
      :key="keyIndex"
    >
      <Option v-for="item in options" :value="item.value" :key="item.value">{{
        item.label
      }}</Option>
    </Select>
    <Divider />

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
      <button @click="toTestApi">
        test Api
      </button>

      <button @click="toTestList">
        test list
      </button>
      <button @click="toTestView">
        test view
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

import { sleep } from '@/utils'
export default {
  name: 'Home',
  components: {},
  mixins: [],

  data() {
    return {
      api,
      image: '',

      keyIndex: 1,

      model11: 1,
      loading1: false,
      options: []
    }
  },
  computed: {
    defaultLable() {
      const defs = this.options_default.filter(
        item => item.value === this.model11
      )
      let label = null
      if (defs.length) {
        label = defs[0].label
      } else {
        label = ''
      }

      console.log('defaultLable: get:', label)

      return label
    },
    options2() {
      console.log('options2: get')
      let ops = []
      if (this.options.length) {
        ops = [...this.options]
      } else {
        ops = [...this.options_default]
      }
      console.log('options2: get,2,', ops)
      return ops
    },

    options_default() {
      return [
        { value: 1, label: 'New York' }
        // { value: 2, label: 'London' },
        // { value: 3, label: 'Sydney' },
        // { value: 4, label: 'Ottawa' },
        // { value: 5, label: 'Paris' },
        // { value: 6, label: 'Canberra' }
      ]
    },

    dataGet() {
      return [
        { value: 1, label: 'New York' },
        { value: 2, label: 'London' },
        { value: 3, label: 'Sydney' },
        { value: 4, label: 'Ottawa' },
        { value: 5, label: 'Paris' },
        { value: 6, label: 'Canberra' }
      ]
    }
  },
  async created() {
    this.options = [...this.options_default]
    // const Model = api.env.model('res.partner')
    // const record = await Model.browse(9)
    // const o2m = await record.$$child_ids
    // const o2m1 = o2m.getByIndex(0)
    // const nn = o2m1.view_node()
    // console.log(nn)
  },

  methods: {
    //
    //

    toFlash() {
      this.keyIndex = this.keyIndex + 1
    },

    async handleOnOpenChange() {
      console.log('handleOnOpenChange', JSON.stringify(this.model11))
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

    async _get_selection(query) {
      return [...this.dataGet]
    },

    async get_selection(query) {
      console.log('get_selection', JSON.stringify(query))
      if (query === undefined) {
        console.log('get_selection 2', JSON.stringify(query))
        const options = await this._get_selection('')
        // await sleep(1000)
        this.options = [...options]
      }
    },

    async remoteMethod1(query) {
      console.log('remoteMethod1', JSON.stringify(query))

      await this.get_selection()
      console.log('remoteMethod1', JSON.stringify(this.options))

      // if (query !== '') {
      //     this.loading1 = true;
      //     setTimeout(() => {
      //         this.loading1 = false;
      //         const list = this.list.map(item => {
      //             return {
      //                 value: item,
      //                 label: item
      //             };
      //         });
      //         this.options1 = list.filter(item => item.label.toLowerCase().indexOf(query.toLowerCase()) > -1);
      //     }, 200);
      // } else {
      //     this.options1 = [];
      // }
    },

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

    toTestList() {
      this.$router.replace({ path: '/test/list' })
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
