<template>
  <div>
    <div>current:{{ value }}</div>

    <span v-show="showSearchMore">
      <Tag
        v-for="one in get_options().filter(item => value.includes(item.value))"
        :key="one.value"
      >
        {{ one.label }}
      </Tag>
      <a href="javascript:void(0)" @click="searchMore">设置</a>
    </span>

    <Select
      v-show="!showSearchMore"
      v-model="value2"
      ref="select"
      transfer
      multiple
      :placeholder="placeholder"
      @on-change="onChange"
      @on-select="onSelect"
    >
      <slot> </slot>
    </Select>
  </div>
</template>

<script>
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
  name: 'OM2mSelect',
  props: {
    value: { type: [String, Number, Array], default: undefined },
    // label: { type: String, default: undefined },
    placeholder: { type: String, default: undefined },
    // loading: { type: [Boolean], default: false }

    showSearchMore: { type: [Boolean], default: false }

    // searchMoreTitle: { type: String, default: '' },
    // remoteMethod: { type: Function, default: undefined }
  },

  data() {
    return {
      init_finished: false
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
    }
  },

  watch: {},

  mounted() {
    // this.query = this.label
  },

  methods: {
    onChange(value) {
      if (this.init_finished) {
        // console.log('onChange', value)
        this.$emit('on-change', value)
      }
    },

    onSelect(/*value*/) {
      // console.log('onSelect', value)
      this.init_finished = true
    },

    get_options() {
      const slotOptions = this.$slots.default || []
      const selectOptions = extractOptions(slotOptions)
      return selectOptions.map(option => {
        const value = option.componentOptions.propsData.value
        const label = getOptionLabel(option)
        return { value, label }
      })
    },
    async searchMore() {
      console.log('searchMore')
      // this.showSearchMoreModar = true
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
