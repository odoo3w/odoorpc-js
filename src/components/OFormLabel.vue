<template>
  <label
    v-if="node.tagName === 'label' && node.attrs.string"
    :class="className"
    :name="node.attrs.name"
  >
    {{ node.attrs.string }}
  </label>

  <label v-else-if="node.tagName === 'label'" :name="node.attrs.name">
    <ONode
      v-for="(child_of_label, index3) in node.children"
      :key="index3"
      :node="child_of_label"
      :record="record"
      :dataDict="dataDict"
    />
  </label>
</template>

<script>
import ONode from '@/components/ONodeRender'

import ONodeMixin from '@/components/ONodeMixin'

export default {
  name: 'OFormLabel',

  components: { ONode },

  mixins: [ONodeMixin],
  props: {},
  computed: {
    value2() {
      return this.dataDict[this.node.attrs.name] || ''
    },

    // input_id() {
    //   console.log('Label: input_id  ', this.node.attrs.for)
    //   if (this.node.attrs.for) {
    //     const meta = this.record._columns[this.node.attrs.name]
    //     console.log('Label: input_id  ', this.node.attrs.for, meta)
    //     return meta.getInputId(this.record)
    //   } else {
    //     return undefined
    //   }
    // },

    className() {
      const node = this.node

      const classList = [
        'o_form_label',
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

      if (!this.editable && !this.value2) {
        classList.push('o_field_empty')
      }

      return classList.join(' ')
    }
  },

  mounted() {
    // const deep_copy = node => {
    //   return JSON.parse(JSON.stringify(node))
    // }
    // console.log('OFormLabel 2, node:', deep_copy(this.node))
    // console.log('OFormLabel 2, data:', deep_copy(this.dataDict))
  },

  methods: {
    //
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
