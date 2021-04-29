<template>
  <div>
    <!-- <div>current:{{ value }},{{ label }}</div>
    <div>query:{{ query }}</div> -->

    <Select
      v-model="value2"
      ref="select"
      :element-id="elementId"
      filterable
      auto-complete
      transfer
      :placeholder="placeholder"
      :loading="loading"
      @on-open-change="onOpenChange"
      @on-select="onSelect"
      @on-clickoutside="onClickOutside"
    >
      <slot name="input">
        <Input
          v-model="query2"
          :element-id="elementId"
          ref="input"
          slot="input"
          icon="ios-arrow-dropdown"
          :placeholder="placeholder"
        />
      </slot>

      <slot> </slot>

      <span v-show="!loading">
        <!-- <div v-show="show_not_found()" :class="[prefixCls + '-not-found']">
          {{ '无...' }}
        </div> -->

        <ul v-show="show_not_found()">
          <li>{{ '无...' }}</li>
        </ul>

        <ul v-show="showSearchMore">
          <li>
            <a
              v-if="showSearchMore"
              href="javascript:void(0)"
              name=""
              @click="searchMore"
            >
              {{ '搜索更多...' }}
            </a>
          </li>
        </ul>

        <!-- <a
          v-if="showSearchMore"
          href="javascript:void(0)"
          name=""
          @click="searchMore"
          >{{ '搜索更多...' }}</a
        > -->
      </span>
    </Select>

    <Modal v-model="showSearchMoreModar" :title="searchMoreTitle">
      <div slot="footer">
        <Button @click="searchMoreCancel">取消</Button>
      </div>

      <p>Content of dialog</p>
      <p>Content of dialog</p>
      <p>Content of dialog</p>
    </Modal>
  </div>
</template>

<script>
const prefixCls = 'ivu-select'

// import { sleep } from '@/utils'

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

const optionRegexp = /^i-option$|^Option$/i

const findOptionsInVNode = node => {
  const opts = node.componentOptions
  if (opts && opts.tag.match(optionRegexp)) return [node]
  if (!node.children && (!opts || !opts.children)) return []
  const children = [
    ...(node.children || []),
    ...((opts && opts.children) || [])
  ]
  const options = children
    .reduce((arr, el) => [...arr, ...findOptionsInVNode(el)], [])
    .filter(Boolean)
  return options.length > 0 ? options : []
}

const extractOptions = options =>
  options.reduce((options, slotEntry) => {
    return options.concat(findOptionsInVNode(slotEntry))
  }, [])

export default {
  name: 'OM2oSelect',
  props: {
    value: { type: [String, Number], default: undefined },
    label: { type: String, default: undefined },

    elementId: { type: String, default: undefined },

    placeholder: { type: String, default: undefined },
    loading: { type: [Boolean], default: false },

    showSearchMore: { type: [Boolean], default: false },

    searchMoreTitle: { type: String, default: '' },
    remoteMethod: { type: Function, default: undefined }
  },

  data() {
    return {
      prefixCls: prefixCls,
      query: '',
      init_finished: false, // 控制 设置 this.query2 = this.label 只在初始化时执行一次
      query_in_changing: [], // 判断 query 输入框, 是否在连续输入
      query_is_set: false, // 主动 设置 query 时, 不触发 onQueryChange

      showSearchMoreModar: false
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
    // value2(newValue, oldValue) {
    //   console.log('watch, value2,', newValue, oldValue)
    // },
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

  created() {},

  mounted() {
    // console.log('m2o, xxxxxx:', this.elementId)
  },

  methods: {
    onSelect(value) {
      // console.log('onSelect,', value)
      this.query_is_set = true
      this.query = value.label
      this.label2 = value.label
      // this.$emit('on-select', value)
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
        await this.remoteMethodMe()
        // this.$emit('on-open-change', open)
      } else {
        //
      }
    },

    async onQueryChange(query) {
      // console.log('onQueryChange', JSON.stringify(query))
      await this.remoteMethodMe(query)
    },

    async remoteMethodMe(query) {
      // console.log('remoteMethodMe', JSON.stringify(query))
      if (this.remoteMethod) {
        // await sleep(1000)
        await this.remoteMethod(query)
      }
    },

    async searchMore() {
      console.log('searchMore')
      this.showSearchMoreModar = true
    },

    // searchMoreOk() {
    //   //
    // },

    searchMoreCancel() {
      console.log('cance:')
      this.showSearchMoreModar = false
    },

    get_options() {
      const slotOptions = this.$slots.default || []
      const selectOptions = extractOptions(slotOptions)
      return selectOptions.map(option => {
        const value = option.componentOptions.propsData.value
        const label = getOptionLabel(option)
        return { value, label }
      })

      // const options = selectOptions.map(item => {
      //   return {
      //     value: item.componentOptions.propsData.value,
      //     label: getOptionLabel(item)
      //   }
      // })

      // return options
    },

    show_not_found() {
      const options = this.get_options()
      return options.length === 0
    }

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
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
