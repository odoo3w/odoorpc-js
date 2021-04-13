<template>
  <span
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
  name: 'OFieldMany2many',
  mixins: [OFieldMixin],
  props: {},
  computed: {},

  methods: {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
