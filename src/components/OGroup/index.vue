<template>
  <OInnerGroup
    v-if="is_inner_group && level > 0"
    :record="record"
    :node="node"
    :level="level"
    :editable="editable"
  />
  <div v-else-if="is_inner_group && level === 0" :class="className">
    <OInnerGroup
      :record="record"
      :node="node"
      :level="level"
      :editable="editable"
    />
  </div>
  <div v-else :class="className">
    <!-- <div>Group {{ level }} Satrt</div> -->
    <OGroup
      v-for="(child, index) in node.children"
      :key="index"
      :record="record"
      :node="child"
      :level="level + 1"
      :editable="editable"
    />
    <!-- <div>Group {{ level }} End</div> -->
  </div>
</template>

<script>
import OInnerGroup from '@/components/OGroup/OInnerGroup'

export default {
  name: 'OGroup',
  components: { OInnerGroup },

  mixins: [],
  props: {
    editable: { type: Boolean, default: undefined },
    record: {
      type: Object,
      default: () => {
        return {}
      }
    },
    node: {
      type: Object,
      default: () => {
        return { children: [] }
      }
    },
    level: { type: Number, default: 0 }
  },

  computed: {
    is_inner_group() {
      const node = this.node
      return (
        node.children &&
        node.children.length &&
        node.children[0].tagName !== 'group'
      )
    },

    className() {
      const classList = ['o_group']
      if (this.level) {
        classList.push(`o_group_col_${this.level * 6}`)
      }

      return classList.join(' ')
    }
  },
  async created() {
    // const deep_copy = node => {
    //   return JSON.parse(JSON.stringify(node))
    // }
    // console.log('OGroup, xxxxxx:', deep_copy(this.node))
  },

  methods: {
    //
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
