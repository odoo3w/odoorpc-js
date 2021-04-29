<template>
  <OFormHeader
    v-if="node.tagName === 'header'"
    :node="node"
    :record="record"
    :dataDict="dataDict"
    :editable="editable"
  />

  <OFormSheet
    v-else-if="node.tagName === 'sheet'"
    :node="node"
    :record="record"
    :dataDict="dataDict"
    :editable="editable"
  />
  <!-- <OFormChatter
    v-else-if="node.class === 'oe_chatter'"
    :node="node"
  /> -->

  <!-- // partner 页面 有个  alert 需要单独处理 -->
  <ONode
    v-else
    :node="node"
    :record="record"
    :dataDict="dataDict"
    :editable="editable"
  />
</template>

<script>
import ONodeMixin from '@/components/ONodeMixin'

import ONode from '@/components/ONodeRender'

import OFormHeader from '@/components/OFormHeader'
import OFormSheet from '@/components/OFormSheet'
// import OFormChatter from '@/components/OFormChatter'

export default {
  name: 'FormViewItem',

  components: {
    OFormHeader,
    OFormSheet,
    //  OFormChatter,
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
