<template>
  <Table :columns="columns" :data="dataList" @on-row-click="handleOnRowClick">
  </Table>
</template>

<script>
import { parseTime } from '@/utils'

export default {
  name: 'OTreeView',
  props: {
    editable: { type: Boolean, default: undefined },

    record: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },

  data() {
    return {}
  },
  computed: {
    node() {
      return this.record.view_node()
    },
    columns() {
      const cols = this.node.children
        .filter(
          item =>
            item.tagName === 'field' &&
            !item.meta.invisible &&
            item.attribute.attrs.optional !== 'hide' &&
            item.attribute.attrs.widget !== 'activity_exception' &&
            item.attribute.attrs.widget !== 'handle'
        )
        .map(item => {
          return {
            title: item.meta.string,
            key: item.meta.name,
            attrs: item.attribute.attrs,
            meta: item.meta,
            render: (h, { row, column }) => {
              return h('div', [this.renderCell(h, { row, column })])
            }
          }
        })
      return cols
    },

    dataList() {
      if (!this.record.fetch_all) {
        return []
      }
      const dataList = this.record.fetch_all()
      return dataList
    }
  },

  mounted() {
    // const deep_copy = node => {
    //   return JSON.parse(JSON.stringify(node))
    // }
    // console.log('OTreeView, xxxxxx:', deep_copy(this.node))
    // console.log('OTreeView, columns:', this.columns)
    // console.log('OTreeView, xxxxxx:', this.dataList)
    // console.log('OTreeView, xxxxxx:', this.record)
  },
  methods: {
    handleOnRowClick(row) {
      this.$emit('on-row-click', row)
    },
    renderCell(h, { row, column }) {
      // console.log(column.key, column.meta.type, column.attrs.widget)
      // console.log(column.key, column.meta, column.attrs)

      let fn = 'renderChar'

      if (column.attrs.widget === 'monetary') {
        fn = 'renderWidgetMonetary'
      } else if (column.meta.type === 'many2one') {
        fn = 'renderMany2one'
      } else if (column.meta.type === 'selection') {
        fn = 'renderSelection'
      } else if (column.meta.type === 'datetime') {
        fn = 'renderDatetime'
      } else {
        fn = 'renderChar'
      }

      return this[fn](h, { row, column })
      // h('span', 'qq' + row[column.key])
    },

    renderWidgetMonetary(h, { row, column }) {
      const val = row[column.key]
      return h('span', `¥ ${val.toFixed(2)}`)
    },

    renderSelection(h, { row, column }) {
      const val = row[`${column.key}__name`]
      return h('span', val)
    },

    renderMany2one(h, { row, column }) {
      const val = row[`${column.key}__name`]
      return h('span', val)
    },

    renderDatetime(h, { row, column }) {
      const val = row[column.key]
      const val2 = val ? parseTime(val) : ''
      return h('span', val2)
    },

    renderChar(h, { row, column }) {
      return h('span', row[column.key])
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
