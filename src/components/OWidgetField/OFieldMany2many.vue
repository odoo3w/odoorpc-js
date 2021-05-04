<template>
  <span
    :class="className"
    :name="node.attrs.name"
    :placeholder="node.attrs.placeholder"
  >
    {{ value2 }}
  </span>
</template>

<script>
import OFieldMixin from './OFieldMixin'
export default {
  name: 'OFieldMany2many',
  mixins: [OFieldMixin],
  props: {},
  computed: {},

  async mounted() {
    // await this.init()
    // const deep_copy = node => {
    //   return JSON.parse(JSON.stringify(node))
    // }
    // console.log(
    //   'OWidget M2M xxxxxx:',
    //   this.node.attrs.name,
    //   deep_copy(this.node),
    //   this.dataDict
    // )
  },

  methods: {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
