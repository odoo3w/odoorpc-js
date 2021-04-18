<template>
  <div :class="className">
    <div class="o_form_sheet_bg">
      <OViewFormItem
        v-for="(child, index) in node_children"
        :key="keyIndex * 1000 + index"
        :record="record"
        :node="child"
        :editable="editable"
        @on-field-change="onFieldChange"
      />
    </div>
    <!-- <OViewFormItem v-if="node_chatter" :node="node_chatter" /> -->
  </div>
</template>

<script>
import OViewFormItem from './OViewFormItem'

export default {
  name: 'OViewForm',
  components: { OViewFormItem },

  props: {
    editable: { type: Boolean, default: undefined },

    record: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },

  data() {
    return {
      keyIndex: 0,
      node2: this.record.view_node()
    }
  },

  computed: {
    node() {
      console.log(' OView Form, get node,')
      return this.node2
    },

    className() {
      // const node = this.node
      const classList = ['o_form_view']

      if (this.editable) {
        classList.push('o_form_editable')
      }
      return classList.join(' ')
    },

    node_children() {
      const children = (this.node.children || []).filter(
        item => !(item.attribute && item.attribute.class === 'oe_chatter')
      )

      return children
    },

    node_chatter() {
      const chatters = (this.node.children || []).filter(
        item => item.attribute && item.attribute.class === 'oe_chatter'
      )

      return chatters.length ? chatters[0] : null
    }
  },

  async created() {
    // const deep_copy = node => {
    //   return JSON.parse(JSON.stringify(node))
    // }
    // console.log('OViewForm, xxxxxx:', deep_copy(this.node))
    // console.log('OViewForm, xxxxxx:', this.record)
  },

  mounted() {
    // const deep_copy = node => {
    //   return JSON.parse(JSON.stringify(node))
    // }
    // console.log('OViewForm, xxxxxx:', deep_copy(this.node))
    // console.log('OViewForm, xxxxxx:', this.record)
  },

  methods: {
    onFieldChange(
      //  field, value
      field,
      value
    ) {
      console.log('OViewForm, onFieldChange:', field, value)
      const node = this.record.view_node()
      this.node2 = { ...node }
      this.keyIndex = this.keyIndex + 1
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
