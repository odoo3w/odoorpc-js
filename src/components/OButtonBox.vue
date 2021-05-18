<template>
  <div :class="className">
    <ONode
      v-for="(child, index) in node.children"
      :key="index"
      :record="record"
      :node="child"
      :dataDict="dataDict"
      :editable="editable"
    />
  </div>
</template>

<script>
import ONode from '@/components/ONodeRender'

import ONodeMixin from '@/components/ONodeMixin'

export default {
  name: 'OButtonBox',

  components: { ONode },

  mixins: [ONodeMixin],
  props: {
    // editable: { type: Boolean, default: undefined },
    // record: {
    //   type: Object,
    //   default: () => {
    //     return {}
    //   }
    // },
    // node: {
    //   type: Object,
    //   default: () => {
    //     return { children: [] }
    //   }
    // }
  },

  computed: {
    className() {
      const node = this.node
      const classList = [
        'o_not_full',
        ...(node.class ? node.class.split(' ') : [])
      ]

      return classList.join(' ')
    }
  },

  async created() {
    // const deep_copy = node => {
    //   return JSON.parse(JSON.stringify(node))
    // }
    // console.log('OButtonBox, xxxxxx:', deep_copy(this.node))
    // console.log(this.record)
  },
  methods: {
    //
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
