<template>
  <span v-if="editable">
    <!-- <Input
      v-model="value2"
      :class="className"
      style="width:200px"
      :element-id="input_id"
      :name="node.attrs.name"
      :placeholder="node.attrs.placeholder"
      @on-enter="handleOnchange(value2)"
      @on-blur="handleOnchange(value2)"
    /> -->

    <DatePicker
      type="date"
      v-model="value2"
      :class="className"
      :element-id="input_id"
      :placeholder="node.attrs.placeholder"
      style="width: 200px"
    ></DatePicker>
  </span>

  <span
    v-else
    :class="className"
    :name="node.attrs.name"
    :placeholder="node.attrs.placeholder"
  >
    {{ valueName }}
  </span>
</template>

<script>
import OFieldMixin from './OFieldMixin'

import { parseTime } from '@/utils'
export default {
  name: 'OFieldDatetime',
  mixins: [OFieldMixin],
  props: {},
  computed: {
    value2: {
      get() {
        return this.dataDict[this.node.attrs.name] || null
      },
      set(value) {
        this.value = value
      }
    },
    valueName() {
      return this.value2 ? parseTime(this.value2, '{y}-{m}-{d}') : ''
    }
  },
  async mounted() {
    // console.log(' char,', [
    //   this.node.attrs.name,
    //   this.node,
    //   this.dataDict,
    //   this.valueName
    // ])
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
