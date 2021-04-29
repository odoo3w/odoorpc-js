<template>
  <div :class="className">
    <span :class="node.attrs.bg_color">
      {{ node.attrs.title }}
    </span>
  </div>
</template>

<script>
import OFieldMixin from './OFieldMixin'

export default {
  name: 'WidgetRibbon',
  mixins: [OFieldMixin],
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
      const classList = ['ribbon', 'ribbon-top-right']

      if (this.invisible_modifier) {
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
