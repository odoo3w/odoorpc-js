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
        @on-btn-click="handleBtnClick"
      />
    </div>

    <!-- <OViewFormItem v-if="node_chatter" :node="node_chatter" /> -->
    <div>
      //
      <OModalForm
        v-model="showModal"
        :record="modal_record"
        :node="modal_node"
        :dataDict="modal_dataDict"
        :editable="modal_editable"
      />
    </div>
  </div>
</template>

<script>
import OViewFormItem from './OViewFormItem'
import OModalForm from './OModalForm'

export default {
  name: 'OViewForm',
  components: { OViewFormItem, OModalForm },

  props: {
    editable: { type: Boolean, default: undefined },
    // node: {
    //   type: Object,
    //   default: () => {
    //     return {}
    //   }
    // },
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
      showModal: false,

      modal_record: {},
      modal_node: { attrs: {}, children: [] },
      modal_dataDict: {},
      modal_editable: false
    }
  },

  computed: {
    node() {
      return this.record.view_node || { children: [] }
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
      // .filter(item => item.tagName === 'sheet')

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
    // console.log('OViewForm, clss, xxxxxx:', this.record._name, this.record)
    // console.log('OViewForm, data, xxxxxx:', this.dataDict)
    // console.log('date 99,', new Date().getTime())
  },

  methods: {
    async handleBtnClick(type, name) {
      console.log(type, name)
      // this.$emit('on-btn-click', type, name)

      if (type === 'object') {
        console.log('onclick object call:', name)
        await this.record.execute(name)
        await this.record.browse_flash()
      } else if (type === 'action') {
        console.log('onclick action call:', name)
        const action = await this.record.action_load(name)
        console.log('btnClick ', action)
        const view = action.get_view('form')
        console.log('call_action ', view)

        const callback = (
          res //
          // field
        ) => {
          // console.log('web callback,', field, deep_copy(res))
          // console.log('web callback,', field, this.record)
          this.modal_dataDict = { ...res }

          // console.log('web, xxxxxx:', deep_copy(this.dataDict))
        }

        const modal_record = await view.browse(null, { fetch_one: callback })
        console.log('call_action ', modal_record)
        const modal_node = modal_record.view_node

        const deep_copy = node => {
          return JSON.parse(JSON.stringify(node))
        }
        console.log('call_action  2', deep_copy(modal_node))

        this.modal_record = modal_record
        this.modal_node = modal_node
        this.modal_dataDict = modal_record.fetch_one()
        this.modal_editable = true
        this.showModal = true
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
