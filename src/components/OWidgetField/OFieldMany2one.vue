<template>
  <!-- 
    过滤方法, 差点意思
    1 清空时, 该触发, 不触发
    2 选中时, 不该触发, 触发
          filterable
      :remote-method="remoteMethod1"
      :loading="selectOptionLoading"

   -->
  <div v-if="editable" :class="className" :name="node.attribute.attrs.name">
    <Select
      v-model="value2"
      clearable
      transfer
      :placeholder="node.attribute.attrs.placeholder"
      style="width:200px"
      @on-open-change="handelOnOpenChange"
      @on-change="handleOnchange"
    >
      <Option v-for="item in options2" :value="item[0]" :key="item[0]">{{
        item[1]
      }}</Option>
      <Option
        v-if="options.length > options2.length"
        :value="value4more"
        :label="label4more"
        key="all"
      >
        <p @click="searchMore">
          {{ '搜索更多...' }}
        </p>
      </Option>
    </Select>

    <!-- @on-ok="searchMoreOk" -->
    <!-- @on-cancel="searchMoreCancel" -->

    <Modal v-model="showSearchMore" title="Common Modal dialog box title">
      <div slot="footer">
        <Button @click="searchMoreCancel">取消</Button>
      </div>

      <p>Content of dialog</p>
      <p>Content of dialog</p>
      <p>Content of dialog</p>
    </Modal>

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

const VALUE_FOR_MORE = 999999
export default {
  name: 'OFieldMany2one',

  mixins: [OFieldMixin],
  props: {},

  data() {
    return {
      options: [],
      selectOptionLoading: false,
      query: '',

      showSearchMore: false
    }
  },

  computed: {
    options_default() {
      return this.record.get_selection(this.node.meta.name, {
        default: true
      })
    },

    options2() {
      if (this.options.length === 0) {
        return this.options_default
      }
      if (this.options.length < 8) {
        return this.options
      } else {
        return this.options.slice(0, 7)
      }
    },

    value4more() {
      return VALUE_FOR_MORE
    },

    label4more() {
      const values = this.options.filter(item => item[0] === this.value2)
      if (values.length) {
        return values[0][1]
      } else {
        return '...'
      }
    },

    value2: {
      get() {
        return this.node.meta.value || 0
      },
      set(value) {
        if (value !== VALUE_FOR_MORE) {
          this.node.meta.value = value
        }
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
  async created() {
    // const deep_copy = node => {
    //   return JSON.parse(JSON.stringify(node))
    // }
    // console.log('m2o, xxxxxx:', this.node.meta.name, deep_copy(this.node))
    // console.log('OWidgetField, xxxxxx:', this.editable)
  },

  async mounted() {},

  methods: {
    async remoteMethod1(query) {
      console.log('remoteMethod1', query)
      this.getSelectOptions(query)
    },

    async searchMore() {
      console.log('searchMore')
      this.showSearchMore = true
    },

    searchMoreOk() {
      //
    },

    searchMoreCancel() {
      console.log('cance:')
      this.showSearchMore = false
    },

    async getSelectOptions(query = '') {
      // console.log('getSelectOptions', query, this.node)
      const domain = this.node.attribute.attrs.domain
      const context = this.node.attribute.attrs.context
      // console.log('getSelectOptions', query, domain, context)

      this.selectOptionLoading = true
      const res = await this.record.get_selection(this.node.meta.name, {
        name: query,
        domain,
        context
      })
      this.selectOptionLoading = false
      // console.log('getSelectOptions', res)
      this.options = [...res]
    },

    handleOnchange(value) {
      if (value !== undefined) {
        if (value !== VALUE_FOR_MORE) {
          const feild = `$${this.node.meta.name}`
          console.log('handleOnchange, to set: ', value, this.record, this.node)
          this.record[feild] = value
        }
      }
    },

    handelOnOpenChange(value) {
      console.log('handelOnOpenChange', value)
      if (value) {
        this.getSelectOptions()
      }
    },

    btnClick() {
      console.log('btnClick', this.node.meta)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
