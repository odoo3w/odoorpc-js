<template>
  <span v-if="editable && !readonly_modifier">
    {{ value }},{{ value2 }}
    <Input
      v-model="value2"
      type="number"
      :class="className"
      style="width:200px"
      number
      :element-id="input_id"
      :name="node.attrs.name"
      :placeholder="node.attrs.placeholder"
      @on-enter="handleOnchange(value)"
      @on-blur="handleOnchange(value)"
    />
  </span>
  <span
    v-else
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
  name: 'OFieldFloat',
  mixins: [OFieldMixin],
  props: {},
  computed: {
    value2: {
      get() {
        return this.dataDict[this.node.attrs.name] || 0.0
      },
      set(value) {
        this.value = value
      }
    }
  },

  mounted() {
    // const deep_copy = node => {
    //   return JSON.parse(JSON.stringify(node))
    // }
    // console.log('OWidgetField 1, xxxxxx:', [
    //   this.node.attrs.name,
    //   this.value2,
    //   this.meta,
    //   this.input_id,
    //   deep_copy(this.node)
    // ])
    // // // console.log(this.record)
    // // // console.log('OWidgetField 2, xxxxxx:', this.editable)
  },
  methods: {
    //
    // handleOnchange(value) {
    //   console.log(
    //     'handleOnchange float:',
    //     value,
    //     typeof value,
    //     this.record,
    //     this.node
    //   )
    //   // const field = `$${this.node.meta.name}`
    //   // this.record[field] = value
    // }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
