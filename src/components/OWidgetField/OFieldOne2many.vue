<template>
  <!-- :node="o2m_node" -->

  <div
    class="o_field_one2many o_field_widget o_field_x2many o_field_x2many_kanban"
    :name="node.attribute.attrs.name"
    :id="node.meta.input_id"
  >
    <div class="o_cp_controller"></div>
    <OView
      :view_type="o2m_view_type"
      :record="o2m_record"
      :editable="false"
      :key="keyIndex"
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
      keyIndex: 0,
      o2m_view_type: '',
      o2m_record: {}
    }
  },

  computed: {},
  async created() {
    // const deep_copy = node => {
    //   return JSON.parse(JSON.stringify(node))
    // }
    // console.log(
    //   'OWidget O2m 1, xxxxxx:',
    //   this.node.meta.name,
    //   deep_copy(this.node)
    // )

    // console.log(this.record)

    const o2m_record = await this.record[`$$${this.node.meta.name}`]
    // console.log('O2m, ', this.node.meta.name, o2m_record._view_type)

    this.o2m_view_type = o2m_record._view_type
    this.o2m_record = o2m_record
    this.keyIndex = this.keyIndex + 1

    // console.log('o2m,', this.o2m_view_type)
  },
  methods: {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
