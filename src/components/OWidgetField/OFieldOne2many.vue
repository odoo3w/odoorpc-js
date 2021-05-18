<template>
  <!-- :node="o2m_node" -->

  <!--  so, header pick_ids -->

  <!-- <div v-if="!node.attrs.mode" :class="classNameO2m" :name="node.attrs.name">
    {{ o2m_view_type }}
    {{ value2 }}
  </div> -->
  <!-- v-else -->

  <div :class="classNameO2m" :name="node.attrs.name" :id="input_id">
    <div class="o_cp_controller"></div>
    <!-- {{ o2m_view_type }}
    {{ value2 }} -->
    <OView
      :view_type="o2m_view_type"
      :parent-data-dict="dataDict"
      :parent-node="node"
      :parent-record="record"
      :record="o2m_record"
      :editable="editable"
    />
  </div>
</template>

<script>
import OFieldMixin from './OFieldMixin'

import OView from '@/components/OView'

export default {
  name: 'OFieldOne2many',
  components: { OView },
  mixins: [OFieldMixin],
  props: {},

  data() {
    return {
      o2m_view_type: '',
      o2m_record: {}
    }
  },

  computed: {
    classNameO2m() {
      // o_field_one2many o_field_widget o_field_x2many o_field_x2many_kanban
      // o_field_one2many o_field_widget o_field_x2many o_field_x2many_list
      // o_field_one2many o_field_widget

      const classList = []
      classList.push(`o_field_${this.meta.type}`)
      classList.push('o_field_widget')

      if (this.node.class) {
        classList.push(this.node.class)
      }

      if (this.invisible_modifier) {
        classList.push('o_invisible_modifier')
      }
      if (this.readonly_modifier) {
        classList.push('o_readonly_modifier')
      }
      if (this.required_modifier) {
        classList.push('o_required_modifier')
      }

      if (!this.editable && !this.value2) {
        classList.push('o_field_empty')
      }

      return classList.join(' ')
    }
  },
  async created() {},
  async mounted() {
    // console.log('O2m,', this.record._name, this.node.attrs.name)
    const o2m_record = await this.record[`$$${this.node.attrs.name}`]
    this.o2m_record = o2m_record
    // console.log(this.node.attrs.name, o2m_record)
    this.o2m_view_type = o2m_record._view_type

    // this.o2m_view_type = this.record._columns[
    //   this.node.attrs.name
    // ]._get_Relation_view_type(this.record)

    // console.log('O2m, ', this.node.attrs.name, [Relation])

    // // console.log('O2m, ', this.node.attrs.name, o2m_record._view_type)
    // // console.log('o2m,', this.o2m_view_type)
    // const deep_copy = node => {
    //   return JSON.parse(JSON.stringify(node))
    // }
    // console.log(
    //   'OWidget O2m 1, xxxxxx:',
    //   [this.node.attrs.name, this.dataDict, deep_copy(this.node)]
    //   // this.record
    // )
    // console.log(this.record)
  },
  methods: {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
