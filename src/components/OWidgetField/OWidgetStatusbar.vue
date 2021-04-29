<template>
  <div :class="className">
    <button
      v-for="sta in statusbar_visible"
      :key="sta"
      :class="btnClassName(sta)"
      type="button"
      :data-value="sta"
      disabled="disabled"
      :title="sta === value2 ? '当前状态' : '非启用的状态'"
      :aria-pressed="sta === value2"
    >
      {{ selection[sta] }}
    </button>

    <slot />
  </div>
</template>

<script>
import OFieldMixin from './OFieldMixin'

export default {
  name: 'OWidgetStatusbar',

  mixins: [OFieldMixin],
  props: {
    // node: {
    //   type: Object,
    //   default: () => {
    //     return { children: [] }
    //   }
    // }
    // readonly: { type: Boolean, default: false },
    // value: { type: String, default: '' },
    // statusbar_visible: { type: Array, default: () => [] },
    // selection: { type: Array, default: () => [] },
  },

  computed: {
    // value() {
    //   return this.node.meta.value
    // },

    selection() {
      const meta = this.record._columns[this.node.attrs.name]
      return meta.selection.reduce((acc, cur) => {
        acc[cur[0]] = cur[1]
        return acc
      }, {})
    },

    statusbar_visible() {
      //
      return this.node.attrs.statusbar_visible.split(',').reverse()
      //
    },

    className() {
      const classList = ['o_statusbar_status', 'o_field_widget']
      if (this.readonly_modifier) {
        classList.push('o_readonly_modifier')
      }
      return classList.join(' ')
    }
  },

  async mounted() {
    // const deep_copy = node => {
    //   return JSON.parse(JSON.stringify(node))
    // }
    // console.log('OWidgetStatusbar 1, xxxxxx:', [
    //   this.node.attrs.name,
    //   this.value2,
    //   this.meta,
    //   deep_copy(this.node)
    // ])
  },
  methods: {
    btnClassName(value) {
      const classList = [
        'btn',
        'o_arrow_button',
        this.value2 === value ? 'btn-primary' : 'btn-secondary',
        'disabled'
      ]

      return classList.join(' ')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
