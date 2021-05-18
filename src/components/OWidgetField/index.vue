<template>
  <OWidgetStatusbar
    v-if="node.attrs.widget === 'statusbar'"
    :node="node"
    :record="record"
    :dataDict="dataDict"
  />
  <OWidgetMonetary
    v-else-if="node.attrs.widget === 'monetary'"
    :node="node"
    :record="record"
    :dataDict="dataDict"
  />
  <OWidgetStatinfo
    v-else-if="node.attrs.widget === 'statinfo'"
    :node="node"
    :record="record"
    :dataDict="dataDict"
  />

  <OWidgetRadio
    v-else-if="node.attrs.widget === 'radio'"
    :editable="editable"
    :dataDict="dataDict"
    :record="record"
    :node="node"
  />

  <OWidgetMany2manyTags
    v-else-if="node.attrs.widget === 'many2many_tags'"
    :editable="editable"
    :record="record"
    :dataDict="dataDict"
    :node="node"
  />

  <!-- <OWidgetEmail
    v-else-if="node.attrs.widget === 'email'"
    :node="node"
      :dataDict="dataDict"
  /> -->
  <!-- <OWidgetUrl
    v-else-if="node.attrs.widget === 'url'"
    :node="node"
      :dataDict="dataDict"
  /> -->

  <!-- <OWidgetRes_partner_many2one
    v-else-if="node.attrs.widget === 'res_partner_many2one'"
    :node="node"
      :dataDict="dataDict"
  /> -->

  <OFieldBoolean
    v-else-if="meta.type === 'boolean'"
    :editable="editable"
    :dataDict="dataDict"
    :record="record"
    :node="node"
  />

  <OFieldDate
    v-else-if="meta.type === 'date'"
    :editable="editable"
    :record="record"
    :dataDict="dataDict"
    :node="node"
  />

  <OFieldDatetime
    v-else-if="meta.type === 'datetime'"
    :editable="editable"
    :record="record"
    :dataDict="dataDict"
    :node="node"
  />

  <OFieldMany2one
    v-else-if="meta.type === 'many2one'"
    :editable="editable"
    :dataDict="dataDict"
    :record="record"
    :node="node"
  />
  <OFieldSelection
    v-else-if="meta.type === 'selection'"
    :editable="editable"
    :record="record"
    :dataDict="dataDict"
    :node="node"
  />

  <OFieldMany2many
    v-else-if="meta.type === 'many2many'"
    :editable="editable"
    :record="record"
    :dataDict="dataDict"
    :node="node"
  />

  <OFieldOne2many
    v-else-if="meta.type === 'one2many'"
    :editable="editable"
    :record="record"
    :dataDict="dataDict"
    :node="node"
  />

  <OFieldChar
    v-else-if="meta.type === 'char'"
    :editable="editable"
    :record="record"
    :dataDict="dataDict"
    :node="node"
  />

  <OFieldText
    v-else-if="meta.type === 'text'"
    :editable="editable"
    :record="record"
    :dataDict="dataDict"
    :node="node"
  />

  <OFieldInteger
    v-else-if="meta.type === 'integer'"
    :editable="editable"
    :record="record"
    :dataDict="dataDict"
    :node="node"
  />

  <OFieldFloat
    v-else-if="meta.type === 'float'"
    :editable="editable"
    :record="record"
    :dataDict="dataDict"
    :node="node"
  />

  <!-- 不会走到这里 v-else -->
  <span v-else>
    <span v-if="editable">
      edit: {{ node.attrs.name }} {{ node.attrs.string }}
      {{ valueName }}

      <!-- <Input
        v-model="value2"
        :class="classInput"
        :element-id="input_id"
        :name="node.attrs.name"
        :placeholder="node.attrs.placeholder"
        @on-enter="handleOnchange(value)"
        @on-blur="handleOnchange(value)"
      /> -->
    </span>

    <span
      v-else
      :class="className"
      :name="node.attrs.name"
      :placeholder="node.attrs.placeholder"
    >
      read: {{ meta.type }} {{ node.attrs.name }} {{ node.attrs.string }}
      {{ valueName }}
      <!-- <span>{{ valueName }}</span> -->
    </span>
  </span>
</template>

<script>
import OFieldMixin from './OFieldMixin'

import OWidgetStatinfo from './OWidgetStatinfo'
import OWidgetMonetary from './OWidgetMonetary'
import OWidgetStatusbar from './OWidgetStatusbar'
import OWidgetRadio from './OWidgetRadio'
import OWidgetMany2manyTags from './OWidgetMany2manyTags'

import OFieldBoolean from './OFieldBoolean'

import OFieldSelection from './OFieldSelection'
import OFieldDate from './OFieldDate'
import OFieldDatetime from './OFieldDatetime'

import OFieldMany2many from './OFieldMany2many'

// import OFieldMany2one from './OFieldMany2one'
// import OFieldOne2many from './OFieldOne2many'

import OFieldChar from './OFieldChar'
import OFieldText from './OFieldText'

import OFieldInteger from './OFieldInteger'
import OFieldFloat from './OFieldFloat'

export default {
  name: 'OWidgetField',
  mixins: [OFieldMixin],
  components: {
    OWidgetStatinfo,
    OWidgetMonetary,
    OWidgetStatusbar,
    OWidgetRadio,
    OFieldBoolean,
    OFieldSelection,
    OFieldDatetime,
    OFieldDate,
    OFieldMany2many,
    OWidgetMany2manyTags,

    OFieldMany2one: () => import('./OFieldMany2one'),
    OFieldOne2many: () => import('./OFieldOne2many'),
    OFieldChar,
    OFieldText,
    OFieldInteger,
    OFieldFloat
  },
  props: {},

  data() {
    return {}
  },

  computed: {
    // value2: {
    //   get() {
    //     return this.dataDict[this.node.attrs.name] || ''
    //   },
    //   set(value) {
    //     this.value = value
    //   }
    // },

    classInput() {
      const classList = []
      classList.push(`o_field_${this.meta.type}`)
      classList.push('o_field_widget')

      if (this.editable) {
        classList.push('o_input')
      }

      if (this.invisible_modifier) {
        classList.push('o_invisible_modifier')
      }
      if (this.readonly_modifier) {
        classList.push('o_readonly_modifier')
      }
      if (this.required_modifier) {
        classList.push('o_required_modifier')
      }

      return classList.join(' ')
    },

    className() {
      const node = this.node
      const classList = []
      if (node.attrs.widget === 'field_partner_autocomplete') {
        classList.push('o_field_partner_autocomplete')
      } else if (node.attrs.widget === 'radio') {
        classList.push('o_field_radio')
      } else if (node.attrs.widget === 'res_partner_many2one') {
        // <a />
        classList.push('o_field_uri')
      } else {
        // console.log('calsss name, ', this.meta)
        classList.push(`o_field_${this.meta.type}`)
        if (this.meta.type === 'integer') {
          classList.push('o_field_number')
        }
      }

      classList.push('o_field_widget')

      if (node.class) {
        classList.push(node.class)
      }

      if (this.invisible_modifier) {
        classList.push('o_invisible_modifier')
      }
      if (this.readonly_modifier) {
        classList.push('o_readonly_modifier')
      }
      if (this.required_modifier) {
        classList.push('o_required_modifier')
      }

      if (!this.editable && !this.value2) {
        classList.push('o_field_empty')
      }

      return classList.join(' ')
    }
  },

  watch: {
    // value2(newValue, oldValue) {
    //   console.log('watch, value2,', this.node.attrs.name, newValue, oldValue)
    //   this.init()
    // },
    // dataDict: {
    //   handler: function(newValue, oldValue) {
    //     // console.log(
    //     //   'watch, dataDict,',
    //     //   this.node.attrs.name,
    //     //   newValue,
    //     //   oldValue
    //     // )
    //     //  this.init()
    //     // this.keyIndex = this.keyIndex + 1
    //   },
    //   immediate: true,
    //   deep: true
    // }
  },

  async created() {
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
    // console.log(this.record)
    // console.log('OWidgetField 2, xxxxxx:', this.editable)
  },

  mounted() {
    // m2o, m2m 字段的 selection 获取, 应该判断 invisible, readonly
    // 如果不是 编辑状态, 可以 跳过
    //
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
    // // console.log(this.record)
    // // console.log('OWidgetField 2, xxxxxx:', this.editable)
    //
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
