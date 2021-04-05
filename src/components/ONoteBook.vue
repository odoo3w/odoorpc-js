<template>
  <div class="o_notebook">
    <!-- // note book -->

    <Tabs :animated="false" type="card" class="o_note_headers">
      <!-- v-for="(page, index) in node.children.filter(
          item => item.attribute.attrs.name === 'sales_purchases'
        )" -->

      <!-- v-for="(page, index) in node.children.filter(
          item => !item.meta.invisible
        )" -->

      <TabPane
        v-for="(page, index) in node.children"
        :key="index"
        :label="page.attribute.attrs.string"
        :class="ClassNamePage(page)"
      >
        <!-- {{ page.attribute.attrs.string }} -->
        <OFormNodeJS :node="page" />
      </TabPane>
    </Tabs>
  </div>
</template>

<script>
import OFormNodeJS from '@/components/OFormNodeJS.js'
const deep_copy = node => {
  return JSON.parse(JSON.stringify(node))
}

export default {
  name: 'ONoteBook',
  components: { OFormNodeJS },

  props: {
    node: {
      type: Object,
      default: () => {
        return { children: [] }
      }
    }
  },
  async created() {
    console.log(
      'Notebook, xxxxxx:',
      deep_copy(
        this.node.children.filter(
          item => item.attribute.attrs.name === 'sales_purchases'
        )
      )
    )
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
