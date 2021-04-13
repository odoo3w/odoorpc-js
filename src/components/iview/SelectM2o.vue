<template>
  <Select
    v-model="value2"
    ref="select"
    filterable
    :default-label="defaultLabel"
    :loading="loading"
    :remote-method="remoteMethodMe"
    @on-open-change="onOpenChange"
  >
    <Option
      v-for="(option, index) in options"
      :value="option.id"
      :key="index"
      >{{ option.display_name }}</Option
    >
  </Select>
</template>

<script>
export default {
  name: 'SelectM2o',
  props: {
    value: { type: [String, Number], default: undefined },
    defaultLabel: { type: String, default: undefined },

    remoteMethod: { type: Function, default: undefined },
    options: { type: Array, default: () => [] }
  },

  data() {
    return {
      loading: false,
      init_finished: false
    }
  },

  computed: {
    options_default() {
      if (this.value) {
        return [{ value: this.value, label: this.defaultLabel }]
      } else {
        return []
      }
    },

    value2: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    }
  },

  methods: {
    onOpenChange(open) {
      this.$emit('on-open-change', open)
    },

    async remoteMethodMe(query) {
      console.log('remoteMethod3', JSON.stringify(query))
      this.loading = true
      await this.remoteMethod(query)

      if (!this.init_finished) {
        setTimeout(() => {
          // this.toTestList()
          console.log('remoteMethod3  2 ', JSON.stringify(query))
          this.init_finish()

          this.init_finished = true
          this.loading = false
        }, 1)
      } else {
        this.loading = false
      }
    },

    init_finish() {
      console.log('initFinish   ', this.value, this.defaultLabel)
      console.log('initFinish 2 ', this)

      if (this.value) {
        const option = {
          value: this.value,
          label: this.defaultLabel,
          tag: undefined
        }
        // this.initFinished(option)
        // this.$refs.select.onOptionClick(option)
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
