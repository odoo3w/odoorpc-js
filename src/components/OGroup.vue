<template>
  <div class="o_group">
    <OInnerGroup :node="node1" seq="1" col_6 />
    <OInnerGroup :node="node2" seq="2" col_6 />
  </div>
</template>

<script>
import OInnerGroup from '@/components/OInnerGroup.vue'

export default {
  name: 'OGroup',
  components: { OInnerGroup },

  mixins: [],
  props: {
    node: {
      type: Object,
      default: () => {
        return { children: [] }
      },
    },
  },

  computed: {
    node1() {
      return this.node.children[0]
    },
    node2() {
      return this.node.children[1]
    },
  },
  async created() {
    const deep_copy = (node) => {
      return JSON.parse(JSON.stringify(node))
    }
    console.log('OGroup, xxxxxx:', deep_copy(this.node))
  },

  methods: {
    //
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
