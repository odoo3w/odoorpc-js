<template>
  <div class="o_notebook">
    <!-- // note book -->

    <Tabs :animated="false" type="card" class="o_note_headers">
      <TabPane
        v-for="(page, index) in children"
        :key="index"
        :label="page.attribute.attrs.string"
        :class="ClassNamePage(page)"
      >
        <ONode
          :record="record"
          :node="page"
          :editable="editable"
          @on-field-change="onFieldChange"
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
      return this.node.children.filter(item => !item.meta.invisible)
    }
  },

  async created() {
    // const deep_copy = node => {
    //   return JSON.parse(JSON.stringify(node))
    // }
    // console.log(
    //   'Notebook, xxxxxx:',
    //   deep_copy(
    //     this.node.children.filter(
    //       item => item.attribute.attrs.name === 'sales_purchases'
    //     )
    //   )
    // )
  },

  methods: {
    ClassNamePage(page) {
      const classList = []
      if (page.meta.invisible) {
        classList.push('o_invisible_modifier')
      }

      // console.log(page, classList)
      return classList.join(' ')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
