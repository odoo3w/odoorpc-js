<template>
  <div class="o_notebook">
    <!-- // note book -->

    <Tabs :animated="false" type="card" class="o_note_headers">
      <TabPane
        v-for="(page, index) in children"
        :key="index"
        :label="page.attrs.string"
      >
        <!-- {{ page }} -->
        <ONode
          :record="record"
          :node="page"
          :dataDict="dataDict"
          :editable="editable"
        />
      </TabPane>
    </Tabs>
  </div>
</template>

<script>
import ONodeMixin from '@/components/ONodeMixin'

import ONode from '@/components/ONodeRender'

export default {
  name: 'ONoteBook',
  components: { ONode },
  mixins: [ONodeMixin],
  props: {},

  computed: {
    //
    children() {
      return this.node.children.filter(item => {
        const invisible_modifier = this.record._view_invisible(
          item,
          this.dataDict
        )
        return !invisible_modifier
      })
      // .filter(item => item.attrs.name === 'order_lines')

      // .filter(item => item.attrs.name === 'internal_notes')
      // .filter(item => item.attrs.name === 'accounting_disabled')
      // .filter(item => item.attrs.name === 'accounting')
      // .filter(item => item.attrs.name === 'sales_purchases')
    }
  },

  async created() {
    const deep_copy = node => {
      return JSON.parse(JSON.stringify(node))
    }
    console.log(
      'Notebook, xxxxxx:',
      deep_copy(
        this.node
        // .children.filter(
        //   item => item.attrs.name === 'sales_purchases'
        // )
      )
    )
  },

  methods: {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
