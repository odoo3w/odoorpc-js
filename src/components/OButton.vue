<template>
  <button
    type="button"
    :name="node.attrs.name"
    :class="className"
    :aria-label="node.attrs['aria-label']"
    title
    :data-original-title="node.attrs.title"
    @click="btnClick"
  >
    <i v-if="node.attrs.icon" :class="classNameIcon" />
    <span v-if="string"> {{ string }} </span>
    <ONode
      v-else
      v-for="(child, index) in node.children"
      :key="index"
      :node="child"
      :dataDict="dataDict"
      :record="record"
    />
  </button>
</template>

<script>
import ONodeMixin from '@/components/ONodeMixin'

import ONode from '@/components/ONodeRender'

export default {
  name: 'OButton',

  components: { ONode },
  mixins: [ONodeMixin],

  props: {
    // record: {
    //   type: Object,
    //   default: () => {
    //     return {}
    //   }
    // },
    // node: {
    //   type: Object,
    //   default: () => {
    //     return { children: [] }
    //   }
    // },

    isHeader: { type: Boolean, default: false }
  },
  computed: {
    string() {
      const node = this.node
      return node.attrs.string
    },
    classNameIcon() {
      const node = this.node
      const classList = [
        'fa',
        'fa-fw',
        'o_button_icon',
        ...(node.attrs.icon ? node.attrs.icon.split(' ') : [])
      ]

      return classList.join(' ')
    },

    className() {
      const node = this.node
      let classList = ['btn', ...(node.class ? node.class.split(' ') : [])]

      if (this.isHeader) {
        const highlight =
          node.class === 'oe_highlight' || node.class === 'btn-primary'

        classList = ['btn']
        if (highlight) {
          classList.push('btn-primary')
        } else {
          classList.push('btn-secondary')
        }
      }

      if (this.invisible_modifier) {
        classList.push('o_invisible_modifier')
      }

      // console.log('xxxxxx,btn:', classList, node)

      return Array.from(new Set(classList)).join(' ')
    }
  },

  async created() {
    // const deep_copy = node => {
    //   return JSON.parse(JSON.stringify(node))
    // }
    // console.log('Obutton 1, xxxxxx:', deep_copy(this.node))
    // console.log('Obutton 2, xxxxxx:', this.record)
  },

  methods: {
    async btnClick() {
      // console.log('onclick', this.node.attrs)
      // console.log('onclick', this.record)
      this.$emit('on-click', this.node.attrs.type, this.node.attrs.name)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
