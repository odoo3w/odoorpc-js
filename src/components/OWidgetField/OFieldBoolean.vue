<template>
  <div :class="className" :name="node.attribute.attrs.name">
    <Checkbox
      v-model="node.meta.value"
      @on-change="handleOnchange(node.meta.value)"
    />
  </div>
</template>

<script>
import OFieldMixin from './OFieldMixin'

export default {
  name: 'OFieldBoolean',
  mixins: [OFieldMixin],
  props: {},

  computed: {
    // className() {
    //   const node = this.node
    //   const classList = [
    //     'o_field_boolean',
    //     'o_field_widget'
    //     // ...(node.attribute.class ? node.attribute.class.split(' ') : [])
    //   ]
    //   if (node.meta.invisible) {
    //     classList.push('o_invisible_modifier')
    //   }
    //   if (node.meta.readonly) {
    //     classList.push('o_readonly_modifier')
    //   }
    //   if (node.meta.required) {
    //     classList.push('o_required_modifier')
    //   }
    //   return classList.join(' ')
    // }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
