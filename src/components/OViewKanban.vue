<template>
  <div class="o_kanban_view o_res_partner_kanban o_kanban_ungrouped">
    <!-- kanban ok -->
    <Card v-for="(one, index) in node_list" :key="index">
      <!-- :record="one" -->
      <p slot="title">
        <ONode :node="title_node(one)" :record="record" />
      </p>

      <ONode
        v-for="(ch, index2) in one.children.filter(
          item => item.attribute.attrs.name !== 'title'
        )"
        :key="index2"
        :node="ch"
        :record="record"
      />
    </Card>

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
  },

  computed: {
    node() {
      return this.record.view_node()
    },

    node_list() {
      const node = this.template
      return this.dataList.map(item => this.record.node_with_data(node, item))
    },

    template() {
      const templates = this.node.children.filter(
        it2 => it2.tagName === 'templates'
      )
      return templates[0]
    },

    title() {
      const items = this.template.children.filter(
        it2 => it2.attribute.attrs.name === 'title'
      )
      return items[0]
    },

    content() {
      const items = this.template.children.filter(
        it2 => it2.attribute.attrs.name !== 'title'
      )
      return items
    },

    dataList() {
      if (!this.record.fetch_all) {
        return []
      }
      const dataList = this.record.fetch_all()
      return dataList
    }

    // nodes() {
    //   const ids = this.record.ids.slice(0, 11)
    //   return ids.map(item => {
    //     const record = this.record.getById(item)
    //     const node = record.view_node()
    //     return { record, node }
    //   })
    // },
    // kanban() {
    //   return this.nodes.reduce((acc, item) => {
    //     const templates = item.node.children.filter(
    //       it2 => it2.tagName === 'templates'
    //     )
    //     const tmpl_children = templates[0].children

    //     const tmpl = tmpl_children.map(it => {
    //       return { record: item.record, kanban: it }
    //     })

    //     return [...acc, ...tmpl]
    //   }, [])
    // }
  },

  async created() {
    // const deep_copy = node => {
    //   return JSON.parse(JSON.stringify(node))
    // }
    // console.log('KANBAN 1, xxxxxx:', this.node)
    // console.log(this.template)
  },
  methods: {
    title_node(node) {
      const items = node.children.filter(
        it2 => it2.attribute.attrs.name === 'title'
      )
      return items[0]
    }
    // node_with_data(node, data) {
    //   return this.record.node_with_data(node, data)
    // }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
