<template>
  <OWidgetImage v-if="node.tagName === 'field'" :node="node" />
  <OWidgetRibbon
    v-else-if="node.attribute.attrs.name === 'web_ribbon'"
    :node="node"
  />
  <OButtonBox
    v-else-if="node.attribute.attrs.name === 'button_box'"
    :record="record"
    :node="node"
    :editable="editable"
  />
  <ONoteBook
    v-else-if="node.tagName === 'notebook'"
    :record="record"
    :node="node"
    :editable="editable"
  />

  <!-- in v-else:
    node.attribute.class === 'oe_title'
    node.tagName === 'group'
   -->
  <ONode v-else :record="record" :node="node" :editable="editable" />
</template>

<script>
import ONode from '@/components/ONodeRender'

import OWidgetImage from '@/components/OWidgetField/OWidgetImage'
import OWidgetRibbon from '@/components/OWidgetField/OWidgetRibbon'
import OButtonBox from '@/components/OButtonBox'
import ONoteBook from '@/components/ONoteBook'

export default {
  name: 'FormViewItem',

  components: {
    OWidgetImage,
    OWidgetRibbon,
    OButtonBox,
    ONoteBook,
    ONode
  },
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
        return {
          children: []
        }
      }
    }
  },

  data() {
    return {}
  },
  computed: {},

  methods: {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
