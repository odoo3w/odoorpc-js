<template>
  <div :class="className">
    <span :class="node.attribute.attrs.bg_color">
      {{ node.attribute.attrs.title }}
    </span>
  </div>
</template>

<script>
export default {
  name: 'WidgetRibbon',
  props: {
    node: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },

  computed: {
    className() {
      const node = this.node
      const classList = ['ribbon', 'ribbon-top-right']
      if (node.meta.invisible) {
        classList.push('o_invisible_modifier')
      }
      classList.push('o_widget')

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
