<template>
  <div>
    <!-- <div>current:{{ value }},{{ label }}</div> -->
    <!-- @on-change="onChange" -->
    <Select
      v-model="value2"
      ref="select"
      filterable
      auto-complete
      :placeholder="placeholder"
      :loading="loading"
      @on-open-change="onOpenChange"
      @on-select="onSelect"
      @on-clickoutside="onClickOutside"
    >
      <slot name="input">
        <Input
          v-model="query2"
          ref="input"
          slot="input"
          icon="ios-arrow-dropdown"
          :placeholder="placeholder"
        />
      </slot>

      <slot> </slot>
    </Select>
  </div>
</template>

<script>
// import { sleep } from '@/utils'

// const getNestedProperty = (obj, path) => {
//   const keys = path.split('.')
//   return keys.reduce((o, key) => (o && o[key]) || null, obj)
// }

// const getOptionLabel = option => {
//   if (option.componentOptions.propsData.label)
//     return option.componentOptions.propsData.label
//   const textContent = (option.componentOptions.children || []).reduce(
//     (str, child) => str + (child.text || ''),
//     ''
//   )
//   const innerHTML = getNestedProperty(option, 'data.domProps.innerHTML')
//   return textContent || (typeof innerHTML === 'string' ? innerHTML : '')
// }

export default {
  name: 'SelectM2o',
  props: {
    value: { type: [String, Number], default: undefined },
    label: { type: String, default: undefined },
    placeholder: { type: String, default: undefined },
    loading: { type: [Boolean], default: false },
    remoteMethod: { type: Function, default: undefined }
  },

  data() {
    return {
      query: '',
      init_finished: false, // 控制 设置 this.query2 = this.label 只在初始化时执行一次
      query_in_changing: [], // 判断 query 输入框, 是否在连续输入
      query_is_set: false // 主动 设置 query 时, 不触发 onQueryChange
    }
  },

  computed: {
    value2: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    },

    label2: {
      get() {
        return this.label
      },
      set(value) {
        this.$emit('update:label', value)
      }
    },

    query2: {
      get() {
        if (!this.init_finished) {
          return this.label
        } else {
          return this.query
        }
      },
      set(value) {
        this.query = value
      }
    }
  },

  watch: {
    query(newValue /* oldValue */) {
      if (this.loading) {
        return
      }
      if (this.query_is_set) {
        this.query_is_set = false
        return
      }

      // console.log('watch, query,', [newValue, oldValue])
      // 将当前搜索框的内容 暂存, 开启0.5秒定时器
      // 如果是连续输入, 则等待
      // 如果 输入已经停止, 则认为输入完成, 触发搜索
      this.query_in_changing.push(newValue)
      this.$refs.select.visible = true
      setTimeout(() => {
        if (this.query_in_changing.length) {
          const query = this.query_in_changing.shift()
          if (!this.query_in_changing.length) {
            this.onQueryChange(query)
          }
        }
      }, 500)
    }
  },

  mounted() {
    // this.query = this.label
  },

  methods: {
    // onChange(value) {
    //   // console.log('onChange,', value)
    //   // this.$emit('on-change', value)
    // },

    onSelect(value) {
      console.log('onSelect,', value)
      this.query_is_set = true
      this.query = value.label
      this.label2 = value.label
      this.$emit('on-select', value)
      this.$emit('on-change', value.value)
    },
    onClickOutside() {
      // console.log('onClickOutside 1:', [this.label])
      this.query_is_set = true
      this.query = this.label
    },
    async onOpenChange(open) {
      // console.log('onOpenChange,', open, )
      if (open) {
        // this.init_finished = true
        await this.remoteMethodMe()
        // this.init_finished = false
        // this.$emit('on-open-change', open)
      }
    },

    async remoteMethodMe(query) {
      // console.log('remoteMethodMe', JSON.stringify(query))
      if (this.remoteMethod) {
        // await sleep(1000)
        await this.remoteMethod(query)
      }
    },

    async onQueryChange(query) {
      // console.log('onQueryChange', JSON.stringify(query))
      await this.remoteMethodMe(query)
    }

    //  event ok

    // method

    // get_options() {
    //   const select = this.$refs.select
    //   if (select) {
    //     return select.flatOptions.map(option => {
    //       const { componentOptions } = option
    //       const value = componentOptions.propsData.value
    //       const label = getOptionLabel(option)
    //       return { value, label }
    //     })
    //   }
    //   return []
    // },

    // value2label(value) {
    //   // console.log('value2label:', value)
    //   if (!value) {
    //     return undefined
    //   }

    //   const options = this.get_options()
    //   // console.log('value2label:', options)
    //   const ops2 = options.reduce((acc, item) => {
    //     acc[item.value] = item
    //     return acc
    //   }, {})
    //   return (ops2[value] || {}).label
    // }

    // onClear() {
    //   console.log('onClear,')
    //   this.$emit('on-clear')
    //   this.query = ''
    // },

    // onSearch(query) {
    //   console.log('onSearch', query)
    //   this.$emit('on-search')
    // },
    // onClick(event) {
    //   console.log('onClick', event)
    //   this.$emit('on-focus')
    // },

    // onBlur(event) {
    //   console.log('onBlur', event)
    //   this.$emit('on-blur')
    // },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
