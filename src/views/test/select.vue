<template>
  <div>
    <div>
      <div>&nbsp;</div>
      <Select
        v-model="value"
        ref="select"
        filterable
        :default-label="defaultLabel"
        :loading="loading"
        :remote-method="remoteMethod"
        style="width:200px"
        @on-open-change="handleOnOpenChange"
      >
        <Option
          v-for="(option, index) in options"
          :value="option.id"
          :key="index"
          >{{ option.display_name }}</Option
        >
      </Select>

      <div>&nbsp;</div>
    </div>
  </div>
</template>

<script>
// import SelectM2o from '@/components/iview/SelectM2o'

import { sleep } from '@/utils'

export default {
  name: 'Home',
  // components: { SelectM2o },
  mixins: [],

  data() {
    return {
      value: 0,

      options_default: [],
      options: [],

      loading: false,
      visible: false,
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
      let dfts = []
      if (this.options.length) {
        dfts = this.options.filter(item => item.id === this.value)
      } else {
        dfts = this.options_default.filter(item => item.id === this.value)
      }
      return dfts[0].display_name
    }
  },
  async created() {
    this.options_default = [{ id: 2, display_name: '上海' }]
    this.value = 2
    // this.defaultLabel = '上海'
    // this.options = [...this.options_default]
  },

  methods: {
    async handleOnOpenChange(open) {
      console.log('handleOnOpenChange', open, JSON.stringify(this.value))
      this.visible = open
      if (open) {
        // this.$refs.select.setQuery('')
        // this.remoteMethod3()
        // console.log('handleOnOpenChange 2', res)
      }
      // await this.get_selection()
      // // this.toFlash()
      // console.log('handleOnOpenChange 2', this.options)
    },

    async _get_selection(query) {
      return [...this.list2]
    },

    async get_selection(query) {
      console.log('get_selection', JSON.stringify(query))
      if (query === undefined) {
        const options = await this._get_selection('')
        await sleep(2000)
        return options
      }
    },

    async remoteMethod(query) {
      console.log('remoteMethod3', JSON.stringify(query))
      this.loading = true

      if (!this.init_finished) {
        const options = await this.get_selection()
        setTimeout(async () => {
          // this.toTestList()
          console.log('remoteMethod3  2 ', JSON.stringify(query))
          if (this.value) {
            const option = {
              value: this.value,
              label: this.defaultLabel,
              tag: undefined
            }
            this.$refs.select.onOptionClick(option)
            this.$refs.select.visible = this.visible
          }

          this.init_finished = true
        }, 0.01)
        this.options = [...options]
      } else {
        if (query !== this.defaultLabel) {
          const options = await this.get_selection()
          this.options = [...options]
        }
      }

      this.loading = false
    }
  }
}
</script>

<style type="text/css"></style>
