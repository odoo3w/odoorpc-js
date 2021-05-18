<template>
  <div>
    <Modal v-model="value2" :title="node.attrs.string">
      <!-- <OViewForm /> -->
      <!-- <OViewForm
          :record="modal_record"
          :dataDict="modal_dataDict"
          :editable="modal_editable"
        /> -->
    </Modal>

    <!-- <Modal v-model="showSearchMoreModar" :title="searchMoreTitle"> </Modal> -->
  </div>
</template>

<script>
// import { sleep } from '@/utils'

export default {
  name: 'OFormModal',
  props: {
    value: { type: [Boolean], default: false },
    editable: { type: Boolean, default: undefined },

    node: {
      type: Object,
      default: () => {
        return { attrs: {}, children: [] }
      }
    },

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

    // value: { type: [String, Number], default: undefined },
    // label: { type: String, default: undefined },
    // placeholder: { type: String, default: undefined },
    // loading: { type: [Boolean], default: false },

    // showSearchMore: { type: [Boolean], default: false },

    // searchMoreTitle: { type: String, default: '' },
    // remoteMethod: { type: Function, default: undefined }
  },

  data() {
    return {
      //

      modalTitle: ''
    }
  },

  computed: {
    value2: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      }
    }
  },

  watch: {},

  created() {},

  mounted() {},

  methods: {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
