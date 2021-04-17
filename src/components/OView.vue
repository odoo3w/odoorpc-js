<template>
  <!-- :node="node"
    :node="node" -->
  <OViewTree
    v-if="view_type === 'tree'"
    :record="record"
    :editable="editable"
    @on-row-click="handleOnRowClick"
  />
  <OViewKanban
    v-else-if="view_type === 'kanban'"
    :record="record"
    :editable="editable"
  />
  <OViewForm
    v-else-if="view_type === 'form'"
    :record="record"
    :editable="editable"
  />

  <span v-else>
    // no view
  </span>
</template>

<script>
import OViewTree from '@/components/OViewTree'
import OViewKanban from '@/components/OViewKanban'

import OViewForm from '@/components/OViewForm'

export default {
  name: 'OView',
  components: { OViewTree, OViewKanban, OViewForm },

  props: {
    view_type: { type: String, default: '' },
    editable: { type: Boolean, default: undefined },
    keyIndex: { type: Number, default: 0 },

    record: {
      type: Object,
      default: () => {
        return {}
      }
    }
    // node: {
    //   type: Object,
    //   default: () => {
    //     return {
    //       children: []
    //     }
    //   }
    // }
  },

  computed: {
    //
  },
  async created() {
    // const deep_copy = node => {
    //   return JSON.parse(JSON.stringify(node))
    // }
    // console.log('OView, xxxxxx:', deep_copy(this.node))
    // console.log('OView, xxxxxx:', this.record)
  },

  mounted() {
    // const deep_copy = node => {
    //   return JSON.parse(JSON.stringify(node))
    // }
    // console.log('OView, xxxxxx:', deep_copy(this.node))
    // console.log('OView, xxxxxx:', this.record)
  },

  methods: {
    handleOnRowClick(row) {
      this.$emit('on-row-click', row)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
