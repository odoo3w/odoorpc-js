<template>
  <div class="o_form_view">
    <div class="o_form_sheet_bg">
      sheet 1:
      <slot />
      sheet 2:

      <!-- {{ node }}
      <OFormHeader
        v-if="header"
        :buttons="header.buttons"
        :fields="header.fields"
        :status="header.status"
      />

      <OFormSheet :sheet="sheet" /> -->
    </div>
    chatter 1:
    <slot name="chatter" />
    chatter 2:
    <!-- <div class="o_chatter oe_chatter">
      <slot name="chatter" />
    </div> -->
  </div>
</template>

<script>
// import OFormHeader from '@/components/OFormHeader.vue'

// import OFormSheet from '@/components/OFormSheet.js'

export default {
  name: 'OFormView',
  components: {},

  // mixins: [renderTag],

  props: {
    readonly: { type: Boolean, default: undefined },
    node: {
      type: Object,
      default: () => {
        return {
          children: [],
        }
      },
    },

    // header: {
    //   type: Object,
    //   default: () => {
    //     return undefined
    //   },
    // },
    // sheet: {
    //   type: Object,
    //   default: () => {
    //     return { children: [] }
    //   },
    // },
  },

  computed: {
    // className() {
    //   const node = this.node
    //   // console.log('className', node)
    //   const classList = ['o_form_view']
    //   if (this.readonly) {
    //     classList.push('o_form_readonly')
    //   }
    //   return classList.join(' ')
    // },
  },

  // render(createElement) {
  //   // console.log('view node,', this.node)
  //   const node = this.node
  //   const children0 = node.children || []
  //   const chatter = children0.filter((item) => item.tagName === 'aside')
  //   const children = children0.filter((item) => item.tagName !== 'aside')

  //   return createElement('div', { class: this.className }, [
  //     createElement(
  //       'div',
  //       { class: 'o_form_sheet_bg' },
  //       children.map((item) => {
  //         return this.renderNode(createElement, item)
  //       })
  //     ),
  //     chatter.map((item) => this.renderNode(createElement, item)),
  //   ])
  // },
  methods: {
    // renderTemplate(createElement)
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
