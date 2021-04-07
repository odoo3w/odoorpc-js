<template>
  <label
    v-if="node.tagName === 'label' && node.meta.string"
    :class="className"
    :for="node.meta.input_id"
    :name="node.attribute.attrs.name"
  >
    {{ node.meta.string }}
  </label>
  <label
    v-else-if="node.tagName === 'label'"
    :class="className"
    :for="node.meta.input_id"
    :name="node.attribute.attrs.name"
  >
    <ONode
      v-for="(child_of_label, index3) in node.children"
      :key="index3"
      :node="child_of_label"
    />
  </label>
</template>

<script>
import ONode from '@/components/ONodeRender'

export default {
  name: 'OFormLabel',

  components: { ONode },
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

      const classList = [
        'o_form_label',
        ...(node.attribute.class ? node.attribute.class.split(' ') : [])
      ]

      if (node.meta.invisible) {
        classList.push('o_invisible_modifier')
      }
      // Label readonly TBD
      if (node.meta.readonly) {
        classList.push('o_readonly_modifier')
      }
      if (node.meta.required) {
        classList.push('o_required_modifier')
      }

      if (!node.meta.value) {
        classList.push('o_form_label_empty')
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
