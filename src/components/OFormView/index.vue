<template>
  <div :class="className">
    <div class="o_form_sheet_bg">
      <OFormViewItem
        v-for="(child, index) in node_children"
        :key="index"
        :record="record"
        :node="child"
        :editable="editable"
      />
    </div>
    <OFormViewItem v-if="node_chatter" :node="node_chatter" />
  </div>
</template>

<script>
import OFormViewItem from './OFormViewItem'

export default {
  name: 'OFormView',
  components: { OFormViewItem },

  // mixins: [renderTag],

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

  computed: {
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
    const deep_copy = node => {
      return JSON.parse(JSON.stringify(node))
    }
    console.log('OFormView, xxxxxx:', deep_copy(this.node))
    console.log('OFormView, xxxxxx:', this.editable)
  },
  methods: {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
