<template>
  <span :name="node.attrs.name" :class="className">
    ¥&nbsp;{{ valueName }}
  </span>
</template>

<script>
import OFieldMixin from './OFieldMixin'

export default {
  name: 'OWidgetMonetary',

  mixins: [OFieldMixin],

  props: {
    // node: {
    //   type: Object,
    //   default: () => {
    //     return { children: [] }
    //   }
    // }
  },

  computed: {
    className() {
      const node = this.node
      const classList = [
        'o_field_monetary',
        'o_field_number',
        'o_field_widget',
        ...(node.class ? node.class.split(' ') : [])
      ]

      if (this.invisible_modifier) {
        classList.push('o_invisible_modifier')
      }
      if (this.readonly_modifier) {
        classList.push('o_readonly_modifier')
      }
      if (this.required_modifier) {
        classList.push('o_required_modifier')
      }
      return classList.join(' ')
    }
  },

  methods: {
    //
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
