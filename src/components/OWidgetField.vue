<template>
  <span :class="className" :name="node.attribute.attrs.name">
    <!-- 
        radio:  oe_title  company_type
        field_partner_autocomplete: name   H1
        can_create: null
       -->
    <!-- <span v-if="node.attribute.attrs.widget">
      {{ `widget=${node.attribute.attrs.widget}.` }}
    </span> -->

    {{ node.meta.type }} {{ node.meta.string }}
    {{ node.meta.value }}

    <!-- {{ node }} -->
    <!-- {{ value }} -->
  </span>
</template>

<script>
export default {
  name: 'OWidgetField',
  props: {
    node: {
      type: Object,
      default: () => {
        return { children: [] }
      },
    },
    // invisible: { type: Boolean, default: false },
    // readonly: { type: Boolean, default: false },
    // required: { type: Boolean, default: null },
    // name: { type: String, default: '' },
    // value: { type: [String, Number], default: '' },
    // can_create: { type: Boolean, default: false },
    // can_write: { type: Boolean, default: false },
    // // widget: { type: String, default: '' },
    // type: { type: String, default: '' },
  },

  computed: {
    className() {
      const node = this.node
      const classList = [`o_field_${node.meta.type}`, 'o_field_widget']
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
