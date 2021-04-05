<template>
  <div class="o_horizontal_separator">
    {{ node.attribute.attrs.string }}
  </div>
</template>

<script>
export default {
  name: 'OHorizontalSeparator',
  components: {},

  mixins: [],
  props: {
    node: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },

  computed: {},

  methods: {
    //
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
