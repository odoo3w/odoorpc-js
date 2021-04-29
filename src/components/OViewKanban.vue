<template>
  <div class="o_kanban_view o_res_partner_kanban o_kanban_ungrouped">
    <!-- kanban ok -->

    <!-- <div v-for="one in dataList2" :key="-one.id">{{ one.name }}</div> -->

    <Button v-if="parentNode && editable" @click="handleOnCreate">添加</Button>

    <Card v-for="one in dataList2" :key="one.id">
      <p slot="title">
        <ONode :node="title" :record="record" :dataDict="one" />
      </p>

      <ONode
        v-for="(ch, index2) in content"
        :key="index2"
        :node="ch"
        :dataDict="one"
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
    },

    parentRecord: {
      type: Object,
      default: () => {
        return {}
      }
    },

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
    }
  },

  computed: {
    dataList() {
      if (!this.record.fetch_all) {
        return []
      }
      const dataList = this.record.fetch_all()
      return dataList
    },
    dataList2() {
      if (this.parentDataDict) {
        return (
          this.parentDataDict[`${this.parentNode.attrs.name}__record`] || []
        )
      } else {
        return this.dataList
      }
    },

    node() {
      return this.record.view_node()
    },
    template() {
      const templates = this.node.children.filter(
        it2 => it2.tagName === 'templates'
      )
      return templates[0]
    },
    title() {
      const items = this.template.children.filter(
        it2 => it2.attrs.name === 'title'
      )
      return items[0]
    },
    content() {
      const items = this.template.children.filter(
        it2 => it2.attrs.name !== 'title'
      )
      return items
    }
  },

  async created() {
    // const deep_copy = node => {
    //   return JSON.parse(JSON.stringify(node))
    // }
    // console.log('KANBAN 1, xxxxxx:', [deep_copy(this.node), this.title])
    // console.log(this.template)
  },

  async mounted() {
    if (this.parentNode) {
      // const o2m_record =
      await this.parentRecord[`$${this.parentNode.attrs.name}`]
    }
  },
  methods: {
    handleOnCreate() {
      //
      console.log(
        ' kanban, create',
        this.parentDataDict,
        this.parentNode,
        this.parentNode.attrs.context
      )

      const context = this.parentRecord._view_node_attrs_context(
        this.parentNode
      )
      console.log(context)
      // const ss = {
      //   default_parent_id: active_id,
      //   default_street: street,
      //   default_street2: street2,
      //   default_city: city,
      //   default_state_id: state_id,
      //   default_zip: zip,
      //   default_country_id: country_id,
      //   default_lang: lang,
      //   default_user_id: user_id,
      //   default_type: 'other'
      // }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
