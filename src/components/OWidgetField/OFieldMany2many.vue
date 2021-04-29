<template>
  <span
    :class="className"
    :name="node.attrs.name"
    :placeholder="node.attrs.placeholder"
  >
    {{ value2 }}
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
