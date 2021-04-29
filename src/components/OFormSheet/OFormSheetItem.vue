<template>
  <OWidgetImage
    v-if="node.tagName === 'field'"
    :node="node"
    :record="record"
    :dataDict="dataDict"
  />
  <OWidgetRibbon
    v-else-if="node.attrs.name === 'web_ribbon'"
    :dataDict="dataDict"
    :record="record"
    :node="node"
  />
  <OButtonBox
    v-else-if="node.attrs.name === 'button_box'"
    :record="record"
    :dataDict="dataDict"
    :node="node"
    :editable="editable"
  />
  <ONoteBook
    v-else-if="node.tagName === 'notebook'"
    :record="record"
    :dataDict="dataDict"
    :node="node"
    :editable="editable"
  />

  <!-- in v-else:
    node.class === 'oe_title'
    node.tagName === 'group'
   -->
  <ONode
    v-else
    :record="record"
    :dataDict="dataDict"
    :node="node"
    :editable="editable"
  />
</template>

<script>
import ONodeMixin from '@/components/ONodeMixin'

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
  mixins: [ONodeMixin],
  props: {},

  data() {
    return {}
  },
  computed: {},

  methods: {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
