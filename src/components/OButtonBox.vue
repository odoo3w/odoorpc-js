<template>
  <div :class="className">
    <ONode v-for="(child, index) in node.children" :key="index" :node="child" />
  </div>
</template>

<script>
import ONode from '@/components/ONodeRender'

export default {
  name: 'OButtonBox',

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
        'o_not_full',
        ...(node.attribute.class ? node.attribute.class.split(' ') : [])
      ]

      return classList.join(' ')
    }
  },

  async created() {
    // const deep_copy = node => {
    //   return JSON.parse(JSON.stringify(node))
    // }
    // console.log('OButtonBox, xxxxxx:', deep_copy(this.node))
  },
  methods: {
    //
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
