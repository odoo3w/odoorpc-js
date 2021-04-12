<template>
  <!-- :node="node"
    :node="node" -->
  <OViewTree
    v-if="view_type === 'tree'"
    :isMain="isMain"
    :record="record"
    :editable="editable"
  />
  <OViewKanban
    v-else-if="view_type === 'kanban'"
    :record="record"
    :editable="false"
  />
  <OViewForm
    v-else-if="view_type === 'form'"
    :record="record"
    :editable="false"
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
    isMain: { type: Boolean, default: undefined },

    view_type: { type: String, default: '' },

    editable: { type: Boolean, default: undefined },

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

  methods: {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
