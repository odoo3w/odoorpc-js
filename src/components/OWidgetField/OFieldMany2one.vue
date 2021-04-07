<template>
  <div
    v-if="editable"
    :class="className"
    aria-atomic="true"
    :name="node.attribute.attrs.name"
  >
    <div class="o_input_dropdown">
      <!-- v-model="node.meta.value" -->
      <!-- @change="handleOnchange(node.attribute.attrs.name, node.meta.value)" -->
      <!-- :id="node.meta.input_id" -->
      <Select
        v-model="value2"
        class="o_input ui-autocomplete-input"
        :element-id="node.meta.input_id"
        @on-open-change="handelOnOpenChange"
        @on-change="handelOnChange"
      >
        <Option v-for="item in options" :value="item[0]" :key="item[0]">{{
          item[1]
        }}</Option>
      </Select>

      <!-- <input
        type="text"
        v-model="valueName"
        class="o_input ui-autocomplete-input"
        autocomplete="off"
        :id="node.meta.input_id"
        @click="btnDropdown"
      />

      <a
        role="button"
        draggable="false"
        class="o_dropdown_button"
        href="javascript:void(0)"
      /> -->
    </div>

    <button
      type="button"
      class="fa fa-external-link btn btn-secondary o_external_button"
      tabindex="-1"
      draggable="false"
      aria-label="External link"
      title="External link"
      @click="btnClick"
    />
  </div>
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
export default {
  name: 'OFieldMany2one',
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

  data() {
    return {
      options: []
    }
  },

  computed: {
    value2: {
      get() {
        //
        return this.node.meta.value || 0
      },
      set(value) {
        //
      }
    },

    className() {
      const node = this.node
      const classList = []

      if (this.editable) {
        classList.push('o_field_widget')
        classList.push('o_field_many2one')
        classList.push('o_with_button')
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
    //
    console.log('m2o create')
    const res = await this.record.get_selection(this.node.meta.name, {
      default: true
    })
    console.log('dropdown', res)
    this.options = [...res]
  },

  methods: {
    handelOnChange(value) {
      console.log('handleOnchange', this.record, this.node)
      const feild = `$${this.node.meta.name}`
      this.record[feild] = value
    },

    handelOnOpenChange(value) {
      // console.log('handelOnOpenChange', p)
      if (value) {
        this.btnDropdown()
      }
    },

    async btnDropdown() {
      // console.log('dropdown', this.node.meta)
      const res = await this.record.get_selection(this.node.meta.name)
      // console.log('dropdown', res)
      this.options = [...res]
    },

    btnClick() {
      console.log('btnClick', this.node.meta)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
