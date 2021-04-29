<template>
  <div :class="className" aria-atomic>
    <img
      class="img img-fluid"
      :src="valueName"
      alt=""
      :name="node.attrs.name"
      border="1"
    />
  </div>
</template>

<script>
import OFieldMixin from './OFieldMixin'

export default {
  name: 'OWidgetImage',

  mixins: [OFieldMixin],

  props: {
    // node: {
    //   type: Object,
    //   default: () => {
    //     return {}
    //   }
    // }
  },

  computed: {
    className() {
      const node = this.node
      const classList = [
        'o_field_image',
        'o_field_widget',
        ...(node.class ? node.class.split(' ') : [])
      ]
      return classList.join(' ')
    }
  },

  async mounted() {
    // const deep_copy = node => {
    //   return JSON.parse(JSON.stringify(node))
    // }
    // console.log('OWidget Img 1, xxxxxx:', [
    //   this.node.attrs.name,
    //   deep_copy(this.node),
    //   this.valueName
    // ])
    // console.log(this.record)
  },

  methods: {
    //
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
