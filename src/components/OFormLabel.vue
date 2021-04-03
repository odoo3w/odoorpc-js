<template>
  <label :class="className" for="">
    <slot />
  </label>
</template>

<script>
export default {
  name: 'OFormLabel',
  props: {
    node: {
      type: Object,
      default: () => {
        return { children: [] }
      },
    },

    col_6: { type: Boolean, default: false },
  },
  computed: {
    className() {
      const node = this.node
      let classList = [
        'o_form_label',
        ...(node.attribute.class ? node.attribute.class.split(' ') : []),
      ]

      if (node.tagName === 'field') {
        if (node.meta.invisible) {
          classList.push('o_form_label_empty')
        }

        if (node.meta.invisible) {
          classList.push('o_invisible_modifier')
        }
        if (node.meta.readonly) {
          classList.push('o_readonly_modifier')
        }
        if (node.meta.required) {
          classList.push('o_required_modifier')
        }
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
