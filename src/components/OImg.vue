<template>
  <div>
    <img
      :src="node.children[0].meta.value"
      :name="node.attribute.attrs.name"
      :class="className"
    />
  </div>
</template>

<script>
// import ONode from '@/components/ONodeRender'

export default {
  name: 'OButton',

  // components: { ONode },

  props: {
    record: {
      type: Object,
      default: () => {
        return {}
      }
    },
    node: {
      type: Object,
      default: () => {
        return { children: [] }
      }
    },

    isHeader: { type: Boolean, default: false }
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
        ...(node.attribute.class ? node.attribute.class.split(' ') : [])
      ]

      if (node.meta.invisible) {
        classList.push('o_invisible_modifier')
      }

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
    btnClick() {
      console.log('onclick', this.node.attribute.attrs)
      console.log('onclick', this.record)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
