<template>
  <div class="o_form_statusbar">
    <div class="o_statusbar_buttons">
      <OButton
        v-for="(btn, index) in buttons"
        :key="index"
        :node="btn"
        parent="header"
      />
    </div>

    <OWidgetFieldJS v-for="(fld, index) in fields" :key="index" :node="fld" />
  </div>
</template>

<script>
import OButton from '@/components/OButton.vue'
import OWidgetFieldJS from '@/components/OWidgetFieldJS.js'

export default {
  name: 'OFormHeader',
  components: { OButton, OWidgetFieldJS },
  props: {
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
    buttons() {
      const node = this.node
      return node.children.filter(item => item.tagName === 'button')
    },
    fields() {
      const node = this.node
      return node.children.filter(item => item.tagName === 'field')
    }
  },

  async created() {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
