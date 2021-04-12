<template>
  <OWidgetStatusbar
    v-if="node.attribute.attrs.widget === 'statusbar'"
    :node="node"
  />
  <OWidgetMonetary
    v-else-if="node.attribute.attrs.widget === 'monetary'"
    :node="node"
  />
  <OWidgetStatinfo
    v-else-if="node.attribute.attrs.widget === 'statinfo'"
    :node="node"
  />

  <!-- <OWidgetMany2manyTags
    v-else-if="node.attribute.attrs.widget === 'many2many_tags'"
    :node="node"
  /> -->

  <!-- <OWidgetEmail
    v-else-if="node.attribute.attrs.widget === 'email'"
    :node="node"
  /> -->
  <!-- <OWidgetUrl
    v-else-if="node.attribute.attrs.widget === 'url'"
    :node="node"
  /> -->

  <!-- <OWidgetRes_partner_many2one
    v-else-if="node.attribute.attrs.widget === 'res_partner_many2one'"
    :node="node"
  /> -->

  <OFieldBoolean
    v-else-if="node.meta.type === 'boolean'"
    :editable="editable"
    :record="record"
    :node="node"
  />

  <OFieldMany2one
    v-else-if="node.meta.type === 'many2one'"
    :editable="editable"
    :record="record"
    :node="node"
  />
  <OFieldSelection
    v-else-if="node.meta.type === 'selection'"
    :editable="editable"
    :record="record"
    :node="node"
  />

  <OFieldMany2many
    v-else-if="node.meta.type === 'many2many'"
    :editable="editable"
    :record="record"
    :node="node"
  />

  <OFieldOne2many
    v-else-if="node.meta.type === 'one2many'"
    :editable="editable"
    :record="record"
    :node="node"
  />

  <OFieldChar
    v-else-if="node.meta.type === 'char'"
    :editable="editable"
    :record="record"
    :node="node"
  />

  <OFieldInteger
    v-else-if="node.meta.type === 'integer'"
    :editable="editable"
    :record="record"
    :node="node"
  />

  <span v-else>
    <span v-if="editable">
      <Input
        v-model="value2"
        :class="classInput"
        :element-id="node.meta.input_id"
        :name="node.attribute.attrs.name"
        :placeholder="node.attribute.attrs.placeholder"
        @on-enter="handleOnchange(value2)"
        @on-blur="handleOnchange(value2)"
      />

      <!-- <input
        v-model="node.meta.value"
        type="text"
        :class="classInput"
        :id="node.meta.input_id"
        :name="node.attribute.attrs.name"
        :placeholder="node.attribute.attrs.placeholder"
        @change="handleOnchange(node.attribute.attrs.name, node.meta.value)"
      /> -->
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
  </span>
</template>

<script>
import OFieldMixin from './OFieldMixin'

import OWidgetStatinfo from './OWidgetStatinfo'
import OWidgetMonetary from './OWidgetMonetary'
import OWidgetStatusbar from './OWidgetStatusbar'

import OFieldBoolean from './OFieldBoolean'

import OFieldSelection from './OFieldSelection'
import OFieldMany2one from './OFieldMany2one'

import OFieldMany2many from './OFieldMany2many'
// import OFieldOne2many from './OFieldOne2many'

import OFieldChar from './OFieldChar'

import OFieldInteger from './OFieldInteger'

export default {
  name: 'OWidgetField',
  mixins: [OFieldMixin],
  components: {
    OWidgetStatinfo,
    OWidgetMonetary,
    OWidgetStatusbar,
    OFieldBoolean,
    OFieldSelection,
    OFieldMany2one,
    OFieldMany2many,
    OFieldOne2many: () => import('./OFieldOne2many'),
    OFieldChar,
    OFieldInteger
  },
  props: {},

  data() {
    return {}
  },

  computed: {
    value2: {
      get() {
        return JSON.stringify(this.node.meta.value)
      },
      set(value) {
        // this.node.meta.value = value
      }
    },

    classInput() {
      const node = this.node
      const classList = []
      classList.push(`o_field_${node.meta.type}`)
      classList.push('o_field_widget')

      if (this.editable) {
        classList.push('o_input')
      }

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
    },

    className() {
      //

      const node = this.node
      const classList = []
      if (node.attribute.attrs.widget === 'field_partner_autocomplete') {
        classList.push('o_field_partner_autocomplete')
      } else if (node.attribute.attrs.widget === 'radio') {
        classList.push('o_field_radio')
      } else if (node.attribute.attrs.widget === 'res_partner_many2one') {
        // <a />
        classList.push('o_field_uri')
      } else {
        classList.push(`o_field_${node.meta.type}`)
        if (node.meta.type === 'integer') {
          classList.push('o_field_number')
        }
      }

      classList.push('o_field_widget')

      if (node.attribute.class) {
        classList.push(node.attribute.class)
      }

      if (node.meta.invisible) {
        classList.push('o_invisible_modifier')
      }
      if (node.meta.readonly) {
        classList.push('o_readonly_modifier')
      }
      if (node.meta.required) {
        classList.push('o_required_modifier')
      }

      if (!node.meta.value) {
        classList.push('o_field_empty')
      }

      return classList.join(' ')
    }
  },

  async created() {
    // const deep_copy = node => {
    //   return JSON.parse(JSON.stringify(node))
    // }
    // console.log(
    //   'OWidgetField 1, xxxxxx:',
    //   this.node.meta.name,
    //   deep_copy(this.node)
    // )
    // console.log(this.record)
    // console.log('OWidgetField 2, xxxxxx:', this.editable)
  },

  methods: {
    //
    handleOnchange(value) {
      console.log('handleOnchange', value, this.record, this.node)
      // const field = `$${this.node.meta.name}`
      // this.record[field] = value
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
