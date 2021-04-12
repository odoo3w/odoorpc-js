<template>
  <span v-if="editable">
    <Input
      v-model="value2"
      type="number"
      :class="className"
      style="width:200px"
      number
      :element-id="node.meta.input_id"
      :name="node.attribute.attrs.name"
      :placeholder="node.attribute.attrs.placeholder"
      @on-enter="handleOnchange(value2)"
      @on-blur="handleOnchange(value2)"
    />
  </span>
  <span
    v-else
    :class="className"
    :name="node.attribute.attrs.name"
    :placeholder="node.attribute.attrs.placeholder"
  >
    {{ node.meta.valueName }}
  </span>
</template>

<script>
import OFieldMixin from './OFieldMixin'
export default {
  name: 'OFieldInteger',
  mixins: [OFieldMixin],
  props: {},
  computed: {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
