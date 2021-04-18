<template>
  <OFormHeader v-if="node.name === 'header'" :node="node" />
  <OFormSheet
    v-else-if="node.tagName === 'sheet'"
    :node="node"
    :record="record"
    :editable="editable"
    @on-field-change="onFieldChange"
  />
  <!-- <OFormChatter
    v-else-if="node.attribute.class === 'oe_chatter'"
    :node="node"
  /> -->

  <!-- // partner 页面 有个  alert 需要单独处理 -->
  <ONode v-else :node="node" />
</template>

<script>
import ONodeMixin from '@/components/ONodeMixin'

import ONode from '@/components/ONodeRender'

import OFormHeader from '@/components/OFormHeader'
import OFormSheet from '@/components/OFormSheet'
import OFormChatter from '@/components/OFormChatter'

export default {
  name: 'FormViewItem',

  components: { OFormHeader, OFormSheet, OFormChatter, ONode },
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
