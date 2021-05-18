<template>
  <div
    v-if="editable && !readonly_modifier"
    :class="className"
    :name="node.attrs.name"
  >
    <OM2oSelect
      v-model="value2"
      ref="select"
      :label.sync="label"
      :element-id="input_id"
      :loading="loading"
      :remote-method="remoteMethod"
      :showSearchMore="showSearchMore"
      :searchMoreTitle="'搜索'"
      :placeholder="node.attrs.placeholder"
      style="width:200px"
      @on-change="handleOnchange"
    >
      <span v-show="!loading">
        <Option v-for="op in options" :key="op[0]" :value="op[0]">{{
          op[1]
        }}</Option>
      </span>
    </OM2oSelect>

    <!-- 查看 编辑 m2o 字段的 按钮 -->
    <!-- class="fa fa-external-link btn btn-secondary o_external_button" -->
    <!-- <button
      type="button"
      tabindex="-1"
      class="fa fa-external-link o_external_button"
      draggable="false"
      aria-label="External link"
      title="External link"
      @click="btnClick"
    /> -->
  </div>

  <span
    v-else-if="editable || (attrs_options && attrs_options.no_open)"
    :class="className"
    :name="node.attrs.name"
    :placeholder="node.attrs.placeholder"
  >
    <!-- {{ node.attrs.name }}:  -->
    {{ valueName }}
  </span>

  <a
    v-else
    :class="className"
    href="javascript:void(0)"
    :name="node.attrs.name"
    :id="input_id"
    @click="m2oClick"
  >
    <span>{{ valueName }}</span>
  </a>
</template>

<script>
import OFieldMixin from './OFieldMixin'

import OM2oSelect from './OM2oSelect'
// import { sleep } from '@/utils'
export default {
  name: 'OFieldMany2one',
  components: { OM2oSelect },
  mixins: [OFieldMixin],
  props: {},

  data() {
    return {
      value: 0,
      label: '',

      showSearchMore: false,
      options: [],

      loading: false,

      attrs_options: {}
    }
  },

  computed: {
    value2: {
      get() {
        return this.dataDict[this.node.attrs.name] || 0
      },
      set(/*value*/) {}
    },

    valueName() {
      return this.dataDict[`${this.node.attrs.name}__name`]
    },

    className() {
      const classList = []

      if (this.editable) {
        classList.push('o_field_widget')
        classList.push('o_field_many2one')
        // classList.push('o_with_button')
      } else {
        classList.push('o_form_uri')
        classList.push('o_field_widget')
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
    value2(/*newValue, oldValue*/) {
      // console.log('watch, value2,', this.node.attrs.name, newValue, oldValue)
      this.init()
    }
  },

  async created() {
    // await this._getSelectOptions()
    // const deep_copy = node => {
    //   return JSON.parse(JSON.stringify(node))
    // }
    // console.log(
    //   'm2o, create, xxxxxx:',
    //   this.node.attrs.name,
    //   deep_copy(this.node),
    //   deep_copy(this.dataDict)
    // )
    // console.log('m2o, create, xxxxxx:', this.editable)
    // this.attrs_options
  },

  async mounted() {
    await this.init()
    // const deep_copy = node => {
    //   return JSON.parse(JSON.stringify(node))
    // }
    // console.log('m2o, xxxxxx:', this.node.attrs.name, deep_copy(this.node))
    // console.log('m2o, xxxxxx:', this.node.attrs.name, deep_copy(this.dataDict))
    // // console.log('m2o, xxxxxx:', this.node.attrs.name, this.record)
    // console.log('m2o, xxxxxx:', this.node.attrs.name, this.input_id)
  },

  methods: {
    async init() {
      // console.log(
      //   'm2o,  init,',
      //   this.node.attrs.name,
      //   this.dataDict,
      //   this.dataDict[this.node.attrs.name]
      // )
      this.value = this.dataDict[this.node.attrs.name] || 0
      this.label = this.dataDict[`${this.node.attrs.name}__name`] || ''
      this.attrs_options = await this.get_attrs_options()
    },

    async get_attrs_options() {
      const options = await this.record._view_node_attrs_options(this.node)
      // console.log('options ', this.node, options)
      return options
    },

    async _getSelectOptions(query = '') {
      const domain = this.node.attrs.domain
      const context = this.node.attrs.context
      // console.log('getSelectOptions', query, domain, context)
      if (!this.editable || !this.record.get_selection) {
        return []
      }
      const options = await this.record.get_selection(this.node.attrs.name, {
        name: query,
        domain,
        context
      })

      // await sleep(1000)

      const options1 = options.slice(0, 7)
      const show_search_more = options.length > options1.length
      this.showSearchMore = show_search_more

      return options1
    },

    async remoteMethod(query) {
      this.loading = true
      const options = await this._getSelectOptions(query)
      this.options = [...options]
      this.loading = false
    },

    m2oClick() {
      console.log('m2oClick', this.node.attrs)
    },

    btnClick() {
      console.log('btnClick', this.node)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
