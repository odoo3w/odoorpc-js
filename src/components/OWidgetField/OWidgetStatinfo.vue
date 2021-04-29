<template>
  <div :name="node.attrs.name" :class="className">
    <span class="o_stat_value"> {{ valueName }} </span>
    <span class="o_stat_text"> {{ node.attrs.string }} </span>
  </div>
</template>

<script>
import OFieldMixin from './OFieldMixin'

export default {
  name: 'OWidgetStatinfo',

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
        'o_field_widget',
        'o_stat_info',
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
