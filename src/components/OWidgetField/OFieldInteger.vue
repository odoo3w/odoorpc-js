<template>
  <span v-if="editable && !readonly_modifier">
    <Input
      v-model="value2"
      type="number"
      :class="className"
      style="width:200px"
      number
      :element-id="input_id"
      :name="node.attrs.name"
      :placeholder="node.attrs.placeholder"
      @on-enter="handleOnchange(value2)"
      @on-blur="handleOnchange(value2)"
    />
  </span>
  <span
    v-else
    :class="className"
    :name="node.attrs.name"
    :placeholder="node.attrs.placeholder"
  >
    {{ node.attrs.name }}: {{ value2 }}
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
