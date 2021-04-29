<template>
  <div :class="className">
    <div class="o_form_sheet_bg">
      <OViewFormItem
        v-for="(child, index) in node_children"
        :key="keyIndex * 1000 + index"
        :record="record"
        :dataDict="dataDict"
        :node="child"
        :editable="editable"
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
    },
    dataDict: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },

  data() {
    return {
      keyIndex: 0,
      node2: this.record.view_node ? this.record.view_node() : {}
    }
  },

  computed: {
    node() {
      // console.log(' OView Form, get node,')
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
        item => !(item.class === 'oe_chatter')
      )

      // console.log(' OView Form, node_children,', children)
      return children
    },

    node_chatter() {
      const chatters = (this.node.children || []).filter(
        item => item.class === 'oe_chatter'
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
    // console.log('OViewForm, node, xxxxxx:', deep_copy(this.node))
    // console.log('OViewForm, clss, xxxxxx:', this.record)
    // console.log('OViewForm, data, xxxxxx:', this.dataDict)

    console.log('date 99,', new Date().getTime())
  },

  methods: {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
