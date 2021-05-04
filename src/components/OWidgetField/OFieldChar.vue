<template>
  <span v-if="editable && !readonly_modifier">
    <Input
      v-model="value2"
      :class="className"
      :readonly="readonly_modifier"
      style="width:200px"
      :element-id="input_id"
      :name="node.attrs.name"
      :placeholder="node.attrs.placeholder"
      @on-enter="handleOnchange(value2)"
      @on-blur="handleOnchange(value2)"
    />

    <!-- <span> 多语言 </span> -->
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
  name: 'OFieldChar',
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
