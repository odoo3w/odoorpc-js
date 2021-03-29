<template>
  <aside :class="className">
    chatter
  </aside>
</template>

<script>
export default {
  name: 'OFormChatter',
  props: {
    node: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },

  computed: {
    className() {
      const node = this.node
      const classList = [
        'o_chatter',
        ...(node.attribute && node.attribute.class
          ? node.attribute.class.split(' ')
          : []),
      ]
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
