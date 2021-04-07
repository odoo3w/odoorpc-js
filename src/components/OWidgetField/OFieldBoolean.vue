<template>
  <div :class="className" :name="node.attribute.attrs.name">
    <input
      v-model="node.meta.value"
      type="checkbox"
      :id="node.meta.input_id"
      class="custom-control-input"
      :checked="node.meta.value ? 'checked' : undefined"
      :disabled="!editable ? true : undefined"
      @change="handleOnchange(node.attribute.attrs.name, node.meta.value)"
    />
    <label for="node.meta.input_id" class="custom-control-label"> </label>
  </div>
</template>

<script>
export default {
  name: 'OFieldBoolean',
  props: {
    editable: { type: Boolean, default: undefined },
    record: {
      type: Object,
      default: () => {
        return {}
      }
    },
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
      const classList = [
        'o_field_boolean',
        'o_field_widget'
        // ...(node.attribute.class ? node.attribute.class.split(' ') : [])
      ]

      classList.push('custom-control')
      classList.push('custom-checkbox')

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
    }
  },

  methods: {
    handleOnchange(field, value) {
      console.log('handleOnchange', field, value, this.record, this.node)
      this.record[`$${field}`] = value
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
