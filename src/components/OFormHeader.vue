<template>
  <div class="o_form_statusbar">
    <div class="o_statusbar_buttons">
      <OButton
        v-for="(btn, index) in buttons"
        :key="index"
        :node="btn"
        :record="record"
        :dataDict="dataDict"
        :editable="editable"
        isHeader
      />
    </div>

    <OWidgetField
      v-for="(fld, index) in fields"
      :key="index"
      :node="fld"
      :record="record"
      :dataDict="dataDict"
      :editable="editable"
    />
  </div>
</template>

<script>
import OButton from '@/components/OButton'
import OWidgetField from '@/components/OWidgetField'

import ONodeMixin from '@/components/ONodeMixin'

export default {
  name: 'OFormHeader',
  components: { OButton, OWidgetField },

  mixins: [ONodeMixin],

  props: {
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
    buttons() {
      const node = this.node
      return node.children.filter(item => item.tagName === 'button')
    },
    fields() {
      const node = this.node
      return node.children.filter(item => item.tagName === 'field')
    }
  },

  async created() {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
