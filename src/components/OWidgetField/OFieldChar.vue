<template>
  <span v-if="editable">
    <Input
      v-model="value2"
      :element-id="node.meta.input_id"
      :class="className"
      :name="node.attribute.attrs.name"
      :placeholder="node.attribute.attrs.placeholder"
      @on-blur="handleOnchange(value2)"
      @on-enter="handleOnchange(value2)"
    />

    <!-- <input
      v-model="value2"
      type="text"
    
      @change="handleOnchange"
    />

    <span>
      多语言
    </span> -->
  </span>
  <span
    v-else
    :class="className"
    :name="node.attribute.attrs.name"
    :placeholder="node.attribute.attrs.placeholder"
  >
    <!-- 
        radio:  oe_title  company_type
        field_partner_autocomplete: name   H1
        can_create: null
       -->
    <!-- <span v-if="node.attribute.attrs.widget">
      {{ `widget=${node.attribute.attrs.widget}.` }}
    </span> -->

    <!-- {{ node.meta.type }} {{ node.meta.string }} -->
    {{ node.meta.valueName }}
    <!-- <span>{{ node.meta.valueName }}</span> -->
  </span>
</template>

<script>
export default {
  name: 'OFieldBoolean',
  props: {
    editable: { type: Boolean, default: undefined },
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
    }
  },

  computed: {
    value2: {
      get() {
        return this.node.meta.value || ''
      },
      set(value) {
        this.node.meta.value = value

        // const feild = `$${this.node.meta.name}`
        // this.record[feild] = value
      }
    },

    className() {
      const node = this.node
      const classList = [
        'o_field_char',
        'o_field_widget'
        // ...(node.attribute.class ? node.attribute.class.split(' ') : [])
      ]

      if (this.editable) {
        classList.push('o_input')
      }

      //
      // if (!'多语言') {
      //   classList.push('o_field_translate')
      // }

      if (node.meta.invisible) {
        classList.push('o_invisible_modifier')
      }
      if (node.meta.readonly) {
        classList.push('o_readonly_modifier')
      }
      if (node.meta.required) {
        classList.push('o_required_modifier')
      }
      return classList.join(' ')
    }
  },

  methods: {
    handleOnchange(value) {
      // console.log('handleOnchange', p, this.record, this.node)
      // this.record[`$${field}`] = value

      const feild = `$${this.node.meta.name}`
      this.record[feild] = value
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
