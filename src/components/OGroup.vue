<template>
  <div :class="className">
    <!-- <div>Group {{ level }} Satrt</div> -->
    <slot />
    <!-- <div>Group {{ level }} End</div> -->
    <!-- <OInnerGroup
      v-for="(inner, index) in node.children"
      :key="index"
      :node="inner"
      :seq="index"
      col_6
    /> -->
    <!-- <OInnerGroup :node="node.children[0]" :seq="2" col_6 /> -->
  </div>
</template>

<script>
// import OInnerGroup from '@/components/OInnerGroup.vue'

export default {
  name: 'OGroup',
  components: {},

  mixins: [],
  props: {
    node: {
      type: Object,
      default: () => {
        return { children: [] }
      }
    },
    level: { type: Number, default: 0 }
  },

  computed: {
    className() {
      const classList = ['o_group']
      if (this.level) {
        classList.push(`o_group_col_${this.level * 6}`)
      }

      return classList.join(' ')
    }
  },
  async created() {
    const deep_copy = node => {
      return JSON.parse(JSON.stringify(node))
    }
    // console.log('OGroup, xxxxxx:', deep_copy(this.node))
  },

  methods: {
    //
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
