<template>
  <div v-if="editable" :class="className" :name="node.attribute.attrs.name">
    <!-- <div>currentValue: {{ value }},{{ label }}</div> -->

    <!-- style="width:200px" -->

    <OM2oSelect
      v-model="value2"
      ref="select"
      :label.sync="label"
      :loading="loading"
      :remote-method="remoteMethod"
      :showSearchMore="showSearchMore"
      :searchMoreTitle="'搜索'"
      placeholder="input here"
      @on-change="handleOnchange"
    >
      <span v-show="!loading">
        <Option v-for="op in options" :key="op[0]" :value="op[0]">{{
          op[1]
        }}</Option>
        <!-- <div v-show="options.length === 0">{{ '无...' }}</div> -->
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
    v-else-if="
      node.attribute.attrs.options && node.attribute.attrs.options.no_open
    "
    :class="className"
    :name="node.attribute.attrs.name"
    :placeholder="node.attribute.attrs.placeholder"
  >
    {{ node.meta.valueName }}
  </span>

  <a
    v-else
    :class="className"
    href="javascript:void(0)"
    :name="node.attribute.attrs.name"
    :id="node.meta.input_id"
  >
    <span>{{ node.meta.valueName }}</span>
  </a>
</template>

<script>
import OFieldMixin from './OFieldMixin'

// import OM2oSelect from '@/components/OWidgetField/OM2oSelect'
// import { sleep } from '@/utils'
export default {
  name: 'OFieldMany2one',
  components: {
    // OM2oSelect

    OM2oSelect: () => import('./OM2oSelect')
  },
  mixins: [OFieldMixin],
  props: {},

  data() {
    return {
      value: 0,
      label: '',

      showSearchMore: false,
      options: [[3, '33']],

      loading: false
    }
  },

  computed: {
    value2: {
      get() {
        return this.dataDict[this.node.meta.name] || 0
        // return this.node.meta.value || 0
      },
      set(value) {
        this.node.meta.value = value
      }
    },

    className() {
      const node = this.node
      const classList = []

      if (this.editable) {
        classList.push('o_field_widget')
        classList.push('o_field_many2one')
        // classList.push('o_with_button')
      } else {
        classList.push('o_form_uri')
        classList.push('o_field_widget')
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
    }
  },

  watch: {
    record(value) {
      console.log('watch, record,', value)
    },
    value2(newValue, oldValue) {
      console.log('watch, value2,', newValue, oldValue)
    },

    dataDict: {
      handler: function(newValue, oldValue) {
        console.log('watch, dataDict,', newValue, oldValue)
      },
      deep: true
    },
    options: {
      handler: function(newValue, oldValue) {
        console.log('watch, options,', newValue, oldValue)
      },
      deep: true
    }
  },

  async created() {
    // await this._getSelectOptions()
    // const deep_copy = node => {
    //   return JSON.parse(JSON.stringify(node))
    // }
    // console.log(
    //   'm2o, create, xxxxxx:',
    //   this.node.meta.name,
    //   deep_copy(this.node),
    //   deep_copy(this.dataDict)
    // )
    // console.log('m2o, create, xxxxxx:', this.editable)
  },

  async mounted() {
    await this.init()
    // const deep_copy = node => {
    //   return JSON.parse(JSON.stringify(node))
    // }
    // console.log('m2o, xxxxxx:', this.node.meta.name, deep_copy(this.node))
    // console.log('m2o, xxxxxx:', this.node.meta.name, deep_copy(this.dataDict))
  },

  methods: {
    async init() {
      this.value = this.node.meta.value || 0
      this.label = this.node.meta.valueName || ''
      // await this._getSelectOptions()
    },

    async _getSelectOptions(query = '') {
      const domain = this.node.attribute.attrs.domain
      const context = this.node.attribute.attrs.context
      // console.log('getSelectOptions', query, domain, context)
      // this.selectOptionLoading = true
      if (!this.editable || !this.record.get_selection) {
        return []
      }
      const options = await this.record.get_selection(this.node.meta.name, {
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

      // console.log('remoteMethod', JSON.stringify(query))
      const options = await this._getSelectOptions(query)
      this.options = [...options]
      this.loading = false
    },

    // onChange(value) {
    //   console.log('onChange,', value)
    //   // this.$emit('on-change', value)
    // },

    async handleOnchange(value) {
      console.log(
        ' handleOnchange',
        this.node.meta.name,
        value,
        typeof value,
        this.record,
        this.node,
        this.dataDict
      )
      const field = `$${this.node.meta.name}`
      this.record[field] = value
      await this.record.awaiter
      console.log(' change ok,', this.record)
    },

    btnClick() {
      console.log('btnClick', this.node.meta)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
