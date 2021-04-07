<template>
  <div class="clearfix position-relative o_form_sheet">
    <!-- 
            item.attribute.attrs.name === 'button_box' ||
            item.tagName === 'group2'
            item.attribute.class === 'oe_title' 
    -->

    <!-- .filter(  item =>  item.attribute.class === 'oe_title' ) -->

    <OFormSheetItem
      v-for="(child, index) in node.children"
      :key="index"
      :record="record"
      :node="child"
      :editable="editable"
    />
  </div>
</template>

<script>
import OFormSheetItem from './OFormSheetItem'

export default {
  name: 'OFormSheet',
  components: { OFormSheetItem },

  mixins: [],
  props: {
    editable: { type: Boolean, default: undefined },
    record: {
      type: Object,
      default: () => {
        return {}
      }
    },
    node: {
      type: Object,
      default: () => {
        return { children: [] }
      }
    }
  },

  computed: {},

  methods: {
    //
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
