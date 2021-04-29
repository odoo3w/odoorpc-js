<template>
  <div>
    <img
      :src="dataDict[node.children[0].attrs.name]"
      :name="node.attrs.name"
      :class="className"
    />
  </div>
</template>

<script>
import ONodeMixin from '@/components/ONodeMixin'

export default {
  name: 'OImg',

  mixins: [ONodeMixin],

  props: {},
  computed: {
    className() {
      const node = this.node
      let classList = [...(node.class ? node.class.split(' ') : [])]

      if (this.invisible_modifier) {
        classList.push('o_invisible_modifier')
      }

      return Array.from(new Set(classList)).join(' ')
    }
  },

  async created() {
    // const deep_copy = node => {
    //   return JSON.parse(JSON.stringify(node))
    // }
    // console.log('OIMG 1, xxxxxx:', deep_copy(this.node), this.dataDict)
    // console.log('Obutton 2, xxxxxx:', this.record)
  },

  methods: {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
