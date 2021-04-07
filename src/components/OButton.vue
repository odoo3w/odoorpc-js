<template>
  <button
    type="button"
    :name="node.attribute.attrs.name"
    :aria-label="node.attribute.attrs['aria-label']"
    title
    :data-original-title="node.attribute.attrs.title"
    :class="className"
    @click="btnClick"
  >
    <i v-if="node.attribute.attrs.icon" :class="classNameIcon" />
    <span v-if="string"> {{ string }} </span>
    <ONode
      v-else
      v-for="(child, index) in node.children"
      :key="index"
      :node="child"
    />

    <slot />
  </button>
</template>

<script>
import ONode from '@/components/ONodeRender'

export default {
  name: 'OButton',

  components: { ONode },

  props: {
    node: {
      type: Object,
      default: () => {
        return { children: [] }
      }
    },

    parent: { type: String, default: '' }
  },
  computed: {
    string() {
      const node = this.node
      return node.attribute.attrs.string
    },
    classNameIcon() {
      const node = this.node
      const classList = [
        'fa',
        'fa-fw',
        'o_button_icon',
        ...(node.attribute.attrs.icon
          ? node.attribute.attrs.icon.split(' ')
          : [])
      ]

      return classList.join(' ')
    },

    className() {
      const node = this.node
      let classList = [
        'btn',
        ...(node.attribute.class ? node.attribute.class.split(' ') : [])
      ]

      if (this.parent === 'header') {
        const highlight =
          node.attribute.class === 'oe_highlight' ||
          node.attribute.class === 'btn-primary'

        classList = ['btn']
        if (highlight) {
          classList.push('btn-primary')
        } else {
          classList.push('btn-secondary')
        }
      }

      if (node.meta.invisible) {
        classList.push('o_invisible_modifier')
      }

      // console.log('xxxxxx,btn:', classList, node)

      return Array.from(new Set(classList)).join(' ')
    }
  },

  methods: {
    btnClick() {
      console.log('onclick', this.node.attribute.attrs)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
