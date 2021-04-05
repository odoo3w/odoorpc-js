<template>
  <span
    :class="className"
    :name="node.attribute.attrs.name"
    :placeholder="node.attribute.attrs.placeholder"
  >
    <!-- 
        radio:  oe_title  company_type
        field_partner_autocomplete: name   H1
        can_create: null
       -->
    <!-- <span v-if="node.attribute.attrs.widget">
      {{ `widget=${node.attribute.attrs.widget}.` }}
    </span> -->

    <!-- {{ node.meta.type }} {{ node.meta.string }} -->
    <!-- {{ node.meta.valueName }} -->
    <span>{{ node.meta.valueName }}</span>
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
      }
    }
  },

  computed: {
    className() {
      const node = this.node
      const classList = []

      if (node.attribute.attrs.widget === 'field_partner_autocomplete') {
        classList.push('o_field_partner_autocomplete')
      } else {
        classList.push(`o_field_${node.meta.type}`)
        if (node.meta.type === 'integer') {
          classList.push('o_field_number')
        }
      }
      classList.push('o_field_widget')

      if (node.attribute.class) {
        classList.push(node.attribute.class)
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

      if (!node.meta.value) {
        classList.push('o_field_empty')
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
