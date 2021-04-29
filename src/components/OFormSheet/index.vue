<template>
  <div class="clearfix position-relative o_form_sheet">
    <OFormSheetItem
      v-for="(child, index) in children"
      :key="index"
      :record="record"
      :dataDict="dataDict"
      :node="child"
      :editable="editable"
    />
  </div>
</template>

<script>
import ONodeMixin from '@/components/ONodeMixin'

import OFormSheetItem from './OFormSheetItem'

export default {
  name: 'OFormSheet',
  components: { OFormSheetItem },

  mixins: [ONodeMixin],
  props: {},

  computed: {
    children() {
      //
      // item.attrs.name === 'button_box' ||
      //       item.tagName === 'group'
      //       item.class === 'oe_title'
      //       item.tagName === 'notebook'

      return this.node.children.filter(item => {
        return item.tagName === 'notebook'
      })
    }
  },

  methods: {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
