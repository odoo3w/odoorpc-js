<template>
  <div :class="className" aria-atomic>
    <img
      class="img img-fluid"
      alt=""
      :src="node.meta.value"
      :name="node.attribute.attrs.name"
      border="1"
    />
  </div>
</template>

<script>
export default {
  name: 'OWidgetImage',
  props: {
    node: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },

  computed: {
    className() {
      const node = this.node
      const classList = [
        'o_field_image',
        'o_field_widget',
        ...(node.attribute.class ? node.attribute.class.split(' ') : []),
      ]
      return classList.join(' ')
    },
  },

  methods: {
    //
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
