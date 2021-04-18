<template>
  <div>
    <!-- <div>current:{{ value }}</div> -->
    <!-- <div>query:{{ query }}</div> -->
    <!-- 

     
      :loading="loading"
      @on-open-change="onOpenChange"
      @on-select="onSelect"
      @on-clickoutside="onClickOutside"
 -->

    <Select
      v-model="value2"
      ref="select"
      filterable
      auto-complete
      multiple
      :placeholder="placeholder"
      style="width:200px"
    >
      <slot name="input">
        <!-- v-model="query2" -->
        <Input
          ref="input"
          slot="input"
          icon="ios-arrow-down"
          :placeholder="placeholder"
        />
      </slot>

      <slot />
      <a
        v-if="showSearchMore"
        href="javascript:void(0)"
        name=""
        @click="searchMore"
      >
        {{ '搜索更多...' }}
      </a>
    </Select>
  </div>
</template>

<script>
import { sleep } from '@/utils'

export default {
  name: 'OSelect',
  props: {
    value: { type: [String, Number, Array], default: undefined },
    // label: { type: String, default: undefined },
    placeholder: { type: String, default: undefined },
    loading: { type: [Boolean], default: false },
    showSearchMore: { type: [Boolean], default: false },

    remoteMethod: { type: Function, default: undefined }
  },

  data() {
    return {}
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

  mounted() {},

  methods: {
    onSelect(value) {
      console.log('onSelect,', value)
    },
    onClickOutside() {
      console.log('onClickOutside 1:')
    },
    async onOpenChange(open) {
      console.log('onOpenChange,', open)
    },

    async searchMore() {
      console.log('searchMore')
    }

    // async onQueryChange(query) {
    //   // console.log('onQueryChange', JSON.stringify(query))
    // },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
