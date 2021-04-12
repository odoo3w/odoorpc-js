<template>
  <div class="o_kanban_view o_res_partner_kanban o_kanban_ungrouped">
    kanban ok
    <!-- <div v-for="(node, index) in kanban" :key="index">
      {{ node.kanban }}
    </div> -->
    <!-- <ONode
      v-for="(node, index) in kanban"
      class="o_kanban_record"
      :key="index"
      :node="node.kanban"
      :record="node.record"
    /> -->
  </div>
</template>

<script>
import ONode from '@/components/ONodeRender'
export default {
  name: 'OKanbanView',
  components: { ONode },

  mixins: [],
  props: {
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
    //     return { children: [] }
    //   }
    // }
  },

  computed: {
    node() {
      return this.record.view_node()
    },
    nodes() {
      const ids = this.record.ids.slice(0, 11)
      return ids.map(item => {
        const record = this.record.getById(item)
        const node = record.view_node()
        return { record, node }
      })
    },
    kanban() {
      return this.nodes.reduce((acc, item) => {
        const templates = item.node.children.filter(
          it2 => it2.tagName === 'templates'
        )
        const tmpl_children = templates[0].children

        const tmpl = tmpl_children.map(it => {
          return { record: item.record, kanban: it }
        })

        return [...acc, ...tmpl]
      }, [])

      // return this.nodes.map(item => {
      //   const templates = item.node.children.filter(
      //     it2 => it2.tagName === 'templates'
      //   )
      //   const tmpl_children = templates[0].children
      //   return {
      //     record: item.record,
      //     kanbans: tmpl_children
      //   }
      // })
    }
  },

  async created() {
    // const deep_copy = node => {
    //   return JSON.parse(JSON.stringify(node))
    // }
    console.log('KANBAN 1, xxxxxx:', this.node)

    // console.log(this.node)
  },
  methods: {
    //
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
