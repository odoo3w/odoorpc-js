<template>
  <span v-if="editable && !readonly_modifier">
    <DatePicker
      type="datetime"
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
export default {
  name: 'OFieldDatetime',
  mixins: [OFieldMixin],
  props: {},
  computed: {},
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
