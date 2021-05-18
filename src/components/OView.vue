<template>
  <OViewTree
    v-if="view_type === 'tree'"
    :parent-data-dict="parentDataDict"
    :parent-node="parentNode"
    :parent-record="parentRecord"
    :record="record"
    :editable="editable"
    @on-row-click="handleOnRowClick"
  />
  <OViewKanban
    v-else-if="view_type === 'kanban'"
    :parent-data-dict="parentDataDict"
    :parent-node="parentNode"
    :parent-record="parentRecord"
    :record="record"
    :editable="editable"
  />
  <OViewForm
    v-else-if="view_type === 'form'"
    :record="record"
    :dataDict="dataDict"
    :editable="editable"
  />

  <span v-else>
    // no view
    {{ view_type }}
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

    parentNode: {
      type: Object,
      default: () => {
        return {}
      }
    },

    parentDataDict: {
      type: Object,
      default: () => {
        return {}
      }
    },

    parentRecord: {
      type: Object,
      default: () => {
        return {}
      }
    },

    editable: { type: Boolean, default: undefined },

    record: {
      type: Object,
      default: () => {
        return {}
      }
    },

    // node: {
    //   type: Object,
    //   default: () => {
    //     return {}
    //   }
    // },

    dataDict: {
      type: Object,
      default: () => {
        return {}
      }
    },
    dataList: { type: Array, default: () => [] }
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
    // console.log('OView, parentNode,xxxxxx:', deep_copy(this.parentNode))
    // console.log('OView, parentNode,xxxxxx:', this.parentDataDict)
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
