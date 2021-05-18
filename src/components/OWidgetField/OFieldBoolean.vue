<template>
  <span v-if="editable && !readonly_modifier">
    <div :class="className" :name="node.attrs.name">
      <!-- <Checkbox v-model="value2" readonly @on-change="handleOnchange(value2)" /> -->
      <i-switch
        v-model="value2"
        true-color="#13ce66"
        false-color="#ff4949"
        @on-change="handleOnchange(value2)"
      />
    </div>
  </span>
  <span v-else>
    {{ node.attrs.name }}: {{ value2 }},
    <!-- <i-switch
      v-model="value2"
      true-color="#13ce66"
      false-color="#ff4949"
      :before-change="handleBeforeChange"
    /> -->
    <!-- <Switch v-model="switch1" @on-change="change" /> -->
    <!-- {{ value2 }}
    <Switch v-model="value2" :before-change="handleBeforeChange" /> -->
  </span>
</template>

<script>
import OFieldMixin from './OFieldMixin'

export default {
  name: 'OFieldBoolean',
  mixins: [OFieldMixin],
  props: {},

  computed: {
    value2: {
      get() {
        return this.dataDict[this.node.attrs.name]
      },
      set(value) {
        this.value = value
      }
    }

    // className() {
    //   const node = this.node
    //   const classList = [
    //     'o_field_boolean',
    //     'o_field_widget'
    //     // ...(node.attribute.class ? node.attribute.class.split(' ') : [])
    //   ]
    //   if (node.meta.invisible) {
    //     classList.push('o_invisible_modifier')
    //   }
    //   if (node.meta.readonly) {
    //     classList.push('o_readonly_modifier')
    //   }
    //   if (node.meta.required) {
    //     classList.push('o_required_modifier')
    //   }
    //   return classList.join(' ')
    // }
  },

  methods: {
    handleBeforeChange(...ppp) {
      console.log('ppp,', ppp)

      // eslint-disable-next-line no-unused-vars
      return new Promise(resolve => {
        // this.$Modal.confirm({
        //   title: '切换确认',
        //   content: '您确认要切换开关状态吗？',
        //   onOk: () => {
        //     resolve()
        //   }
        // })
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
