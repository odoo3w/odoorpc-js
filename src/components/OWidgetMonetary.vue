<template>
  <span :name="node.attribute.attrs.name" :class="className">
    ¥&nbsp;{{ node.meta.value }}
  </span>
</template>

<script>
export default {
  name: 'OWidgetMonetary',
  props: {
    node: {
      type: Object,
      default: () => {
        return { children: [] }
      },
    },
  },

  computed: {
    className() {
      const node = this.node
      const classList = [
        'o_field_monetary',
        'o_field_number',
        'o_field_widget',
        ...(node.attribute.class ? node.attribute.class.split(' ') : []),
      ]

      if (node.meta.invisible) {
        classList.push('o_invisible_modifier')
      }
      if (node.meta.readonly) {
        classList.push('o_readonly_modifier')
      }
      if (node.meta.required) {
        classList.push('o_required_modifier')
      }
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
