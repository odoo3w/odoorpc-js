<template>
  <div :class="className">
    <button
      v-for="sta in statusbar_visible.reverse()"
      :key="sta"
      :class="btnClassName(sta)"
      type="button"
      :data-value="value"
      disabled="disabled"
      :title="sta === value ? '当前状态' : '非启用的状态'"
      :aria-pressed="false"
    >
      {{ selection[sta] }}
    </button>

    <slot />
  </div>
</template>

<script>
export default {
  name: 'OWidgetStatusbar',
  props: {
    node: {
      type: Object,
      default: () => {
        return { children: [] }
      },
    },

    // readonly: { type: Boolean, default: false },
    // value: { type: String, default: '' },
    // statusbar_visible: { type: Array, default: () => [] },
    // selection: { type: Array, default: () => [] },
  },

  computed: {
    value() {
      return this.node.meta.value
    },

    selection() {
      return this.node.meta.selection.reduce((acc, cur) => {
        acc[cur[0]] = cur[1]
        return acc
      }, {})
    },

    statusbar_visible() {
      return this.node.attribute.attrs.statusbar_visible.split(',')
      //
    },

    className() {
      const node = this.node
      const classList = ['o_statusbar_status', 'o_field_widget']
      if (node.meta.readonly) {
        classList.push('o_readonly_modifier')
      }
      return classList.join(' ')
    },
  },

  methods: {
    btnClassName(value) {
      const classList = [
        'btn',
        'o_arrow_button',
        this.value === value ? 'btn-primary' : 'btn-secondary',
        'disabled',
      ]

      return classList.join(' ')
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
