<template>
  <Select
    v-model="value2"
    ref="select"
    clearable
    filterable
    :default-label="defaultLabel"
    :loading="loading"
    :remote-method="remoteMethodMe"
    @on-open-change="onOpenChange"
    @on-change="onChange"
    @on-select="onSelect"
    @on-clear="onClear"
  >
    <slot />
    <div>haha</div>
    <!-- <Option :value="value4more">
      <p @click="searchMore">
        {{ ' 搜索更多...' }}
      </p>
    </Option> -->
  </Select>
</template>

<script>
const VALUE_FOR_MORE = 999999

const getNestedProperty = (obj, path) => {
  const keys = path.split('.')
  return keys.reduce((o, key) => (o && o[key]) || null, obj)
}

const getOptionLabel = option => {
  if (option.componentOptions.propsData.label)
    return option.componentOptions.propsData.label
  const textContent = (option.componentOptions.children || []).reduce(
    (str, child) => str + (child.text || ''),
    ''
  )
  const innerHTML = getNestedProperty(option, 'data.domProps.innerHTML')
  return textContent || (typeof innerHTML === 'string' ? innerHTML : '')
}

export default {
  name: 'SelectM2o',
  props: {
    value: { type: [String, Number], default: undefined },
    defaultLabel: { type: String, default: undefined },
    remoteMethod: { type: Function, default: undefined }
  },

  data() {
    return {
      loading: false,
      visible: false,
      init_finished: false,
      query: '',

      is_search_more: false
    }
  },

  computed: {
    value2: {
      get() {
        return this.value
      },
      set(value) {
        if (value !== VALUE_FOR_MORE) {
          this.$emit('input', value)
        }
      }
    },

    options() {
      if (this.$refs.select) {
        return this.$refs.select.flatOptions.map(option => {
          const { componentOptions } = option
          const value = componentOptions.propsData.value
          const label = getOptionLabel(option)
          return { value, label }
        })
      }
      return []
    },

    value4more() {
      return VALUE_FOR_MORE
    }
  },

  methods: {
    label4more() {
      console.log('label4more,')

      const values = this.options.filter(item => item[0] === this.value2)
      if (values.length) {
        return values[0][1]
      } else {
        return '...'
      }
    },

    onOpenChange(open) {
      this.visible = open
      this.$emit('on-open-change', open)
      // console.log(this.$refs.select)
      // console.log(this.value)
      // console.log(this.options)
    },

    onClear() {
      console.log('onClear,')
      this.$emit('on-clear')
      this.query = ''
    },
    onChange(value) {
      //  console.log('onChange,', value === VALUE_FOR_MORE, value, this.value2)
      if (value !== VALUE_FOR_MORE) {
        this.$emit('on-change', value)
      }
    },

    onSelect({ value }) {
      console.log('onSelect,', value === VALUE_FOR_MORE, value, this.value2)

      if (value === VALUE_FOR_MORE) {
        this.is_search_more = true
        // console.log('onSelect,1:', value, this.value2, this.query)
        // this.$refs.select.setQuery(this.query)
      } else {
        // console.log('onSelect,2:', value, this.value2, this.defaultLabel)

        const option = this.$refs.select.getOptionData(value)
        this.query = option.label
        this.is_search_more = false
        this.$emit('on-select', value)
      }
      console.log('onSelect 3,', this.is_search_more)
    },

    async searchMore() {
      console.log('searchMore')
      // this.showSearchMore = true
      this.$emit('on-search-more')
    },

    async remoteMethodMe(query) {
      console.log(
        'remoteMethodMe',
        this.is_search_more,
        JSON.stringify(query),
        JSON.stringify(this.query)
      )

      this.loading = true

      if (this.is_search_more) {
        this.$refs.select.visible = false
        if (this.query) {
          this.$refs.select.setQuery(this.query)
        } else {
          this.$refs.select.query = ''
        }
        this.$refs.select.visible = false
        // this.query = query
        setTimeout(() => {
          if (this.value) {
            const option = {
              value: this.value,
              label: this.query,
              tag: undefined
            }

            console.log('remoteMethodMe to set click select', option)
            this.$refs.select.onOptionClick(option)
          }
          console.log(
            'remoteMethodMe to set click select,  no value:',
            JSON.stringify(this.query)
          )
          this.$refs.select.visible = false
        }, 1)
        this.is_search_more = false
      } else if (!this.init_finished) {
        await this.remoteMethod(query)
        setTimeout(() => {
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
        }, 1)
        this.query = query
      } else {
        const optionData = this.$refs.select.getOptionData(this.value)
        const label = optionData ? optionData.label : this.defaultLabel

        if (query !== label) {
          await this.remoteMethod(query)
          this.query = query
        }
      }
      console.log(
        'remoteMethodMe ok',
        this.is_search_more,
        JSON.stringify(query),
        JSON.stringify(this.query)
      )
      this.loading = false
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
