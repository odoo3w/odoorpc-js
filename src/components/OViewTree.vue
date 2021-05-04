<template>
  <span>
    <!-- <a href="javascript:void(0)"> -->
    <Table
      :columns="columns"
      :data="dataList2"
      :span-method="handleSpan"
      @on-row-click="handleOnRowClick"
    >
    </Table>
    <!-- </a> -->

    <Modal v-model="showModal" :title="modalTitle">
      <div slot="footer">
        <span v-if="editable">
          <Button @click="modalOk">保存</Button>
          <Button @click="modalCancel">放弃</Button>
          <Button @click="modalDel">移除</Button>

          <!-- <Button @click="modalOk">保存并关闭</Button>
          <Button @click="modalOkNew">保存并新建</Button>
          <Button @click="modalCancel">放弃</Button> -->
        </span>
        <span v-else>
          <Button @click="modalCancel">关闭</Button>
        </span>
      </div>

      <OViewForm
        :record="currentRecord"
        :dataDict="currentRow"
        :editable="editable"
        :key="keyIndexOfModal"
      />

      <!-- {{ currentRow }} -->
    </Modal>
  </span>
</template>

<script>
import { parseTime } from '@/utils'

import OViewForm from '@/components/OViewForm'
// import OWidgetField from '@/components/OWidgetField'

// const deep_copy = node => {
//   return JSON.parse(JSON.stringify(node))
// }

export default {
  name: 'OTreeView',

  components: {
    OViewForm
    // OWidgetField
    //  OWidgetField: () => import('@/components/OWidgetField')
  },

  props: {
    editable: { type: Boolean, default: undefined },

    record: {
      type: Object,
      default: () => {
        return {}
      }
    },

    parentRecord: {
      type: Object,
      default: () => {
        return {}
      }
    },

    parentNode: {
      type: Object,
      default: () => {
        return {}
      }
    },

    parentDataDict: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },

  data() {
    return {
      showModal: false,
      modalTitle: '明细',
      // currentRowId: 0,
      currentRow: {},
      currentRecord: {},
      keyIndexOfModal: 1
    }
  },
  computed: {
    node() {
      return this.record.view_node()
    },
    columns() {
      const cols = this.node.children
        .filter(item => {
          // 这个为什么没有 this.dataDict
          const invisible_modifier = this.record._view_invisible(
            item
            // this.dataDict
          )
          // const invisible_modifier = this.record._view_invisible(item)

          return (
            item.tagName === 'field' &&
            !invisible_modifier &&
            item.attrs.optional !== 'hide' &&
            item.attrs.widget !== 'activity_exception' &&
            item.attrs.widget !== 'handle'
          )
        })
        .map(item => {
          return {
            title: item.attrs.string,
            key: item.attrs.name,
            attrs: item.attrs,
            render: (h, { row, column }) => {
              return h('div', [this.renderCell(h, { row, column })])
            }
          }
        })

      if (!this.editable) {
        return [...cols]
      }

      const get_action_col = () => {
        const render_button = (h, { icon, onclick }) => {
          return h('Button', {
            attrs: { icon },
            on: {
              click: e => {
                e.stopPropagation()
                onclick()
              }
            }
          })
        }

        // eslint-disable-next-line no-unused-vars
        const render_del_button = (h, { row }) => {
          return render_button(h, {
            icon: 'ios-trash-outline',
            onclick: () => {
              this.handleOnRowDel(row)
            }
          })
        }

        const render_edit_button = (h, { row }) => {
          return render_button(h, {
            icon: 'ios-create-outline',
            onclick: () => {
              this.handleOnRowEdit(row)
            }
          })
        }

        const render_action = (h, { row }) => {
          return h('span', [
            render_edit_button(h, { row })
            // render_del_button(h, { row })
          ])
        }

        return {
          title: ' ',
          key: '_action',
          render: (h, { row, column }) => {
            return render_action(h, { row, column })
          }
        }
      }

      const col_action = get_action_col()
      const cols2 = [...cols, col_action]

      return cols2
    },

    dataList() {
      if (!this.record.fetch_all) {
        return []
      }
      const dataList = this.record.fetch_all()
      return dataList
    },

    hasParent() {
      return (
        Object.keys(this.parentDataDict).length &&
        Object.keys(this.parentNode).length
      )
    },

    dataList1() {
      if (this.hasParent) {
        return (
          this.parentDataDict[`${this.parentNode.attrs.name}__record`] || []
        )
        // .slice(0, 3)
      } else {
        return this.dataList
      }
    },

    dataList2() {
      const dataList = this.dataList1

      if (!this.editable) {
        return [...dataList]
      }

      const get_action_row = () => {
        if (this.parentNode && this.editable) {
          return [{ id: '_action_row' }]
        } else {
          return []
        }
      }

      const dataList2 = [...dataList, ...get_action_row()]

      return dataList2
    }

    // currentRow() {
    //   const rows = this.dataList1.filter(item => item.id === this.currentRowId)
    //   return rows.length ? rows[0] : {}
    // }
  },

  mounted() {
    // const deep_copy = node => {
    //   return JSON.parse(JSON.stringify(node))
    // }
    // console.log('OTreeView, xxxxxx:', deep_copy(this.node))
    // console.log('OTreeView, columns:', this.columns)
    // // console.log('OTreeView, xxxxxx:', this.dataList)
    // // console.log('OTreeView, xxxxxx:', this.record)
  },
  methods: {
    // eslint-disable-next-line no-unused-vars
    handleSpan({ row, column, rowIndex, columnIndex }) {
      if (row.id === '_action_row') {
        // console.log('handleSpan', row, column, rowIndex, columnIndex)

        return { rowspan: 1, colspan: this.columns.length }
      }
    },

    async handleOnRowCreate() {
      console.log('click row new', this)
      // this.parentNode
      // 从 this.parentNode 取  default

      this.currentRow = {}

      const callback = res => {
        console.log('handleOnRowCreate, callback,  ', res)
        this.currentRow = { ...res }
      }
      const records2 = await this.record.new_copy({
        fetch_one: callback,
        form_record: [
          this.parentRecord,
          this.parentRecord._columns[this.parentNode.attrs.name]
        ]
      })

      console.log('click row new', records2)
      this.currentRecord = records2
      // this.currentRowId = row.id
      this.showModal = true
      this.keyIndexOfModal = this.keyIndexOfModal + 1
    },

    async handleOnRowEdit(row) {
      console.log('click row edit', row.id, row)
      // await this.record.remove(row.id)
      this.handleOnRowClick(row)
    },

    async handleOnRowDel(row) {
      console.log('click row del', row.id, row)
      await this.record.remove(row.id)
    },

    async handleOnCreate() {
      console.log('click new', this)
      // const new_rec = await this.record.new()
      // console.log(new_rec)
    },

    handleOnRowClick(row) {
      if (!this.hasParent) {
        this.$emit('on-row-click', row)
        return
      }

      // const record = this.record.getById(row.id)
      // this.currentRecord = record
      // this.currentRow = { ...row }
      // // this.currentRowId = row.id
      // this.showModal = true
      // this.keyIndexOfModal = this.keyIndexOfModal + 1

      //

      // console.log('date 10,', this.parentNode.attrs.name)

      const record = this.record.getById(row.id)

      if (this.editable) {
        const callback = res => {
          console.log('handleOnRowClick, callback,  ', res)
          this.currentRow = { ...res }
        }
        const records2 = record.copy({
          fetch_one: callback,
          form_record: [
            this.parentRecord,
            this.parentRecord._columns[this.parentNode.attrs.name]
          ]
        })

        this.currentRecord = records2
      } else {
        this.currentRecord = record
        this.currentRow = { ...row }
      }

      // this.currentRowId = row.id
      this.showModal = true
      this.keyIndexOfModal = this.keyIndexOfModal + 1

      // console.log('date 10,', new Date().getTime())

      // console.log('handleOnRowClick1,', record)
      // console.log('handleOnRowClick2,', records2)
      // console.log('date 10,', new Date().getTime(), records2)
      // console.log('date 99,', new Date().getTime())
    },

    modalCancel() {
      console.log('modalCancel')
      this.showModal = false
    },

    async modalOk() {
      await this.currentRecord.awaiter
      console.log('modalOk', this.currentRecord)
      await this.record.update(this.currentRecord)

      this.showModal = false
      // await this.currentRecord.trigger_parent_onchange()
    },

    modalOkNew() {
      console.log('modalOkNew')
      // this.showModal = true
    },

    async modalDel() {
      console.log('modalDel')
      await this.record.remove(this.currentRecord.id)
      this.showModal = false
    },

    renderCell(h, { row, column }) {
      if (row.id === '_action_row') {
        return h(
          'Button',
          {
            on: {
              click: e => {
                e.stopPropagation()
                this.handleOnRowCreate()
              }
            }
          },
          '新增'
        )
      }
      // console.log(column.key, column.meta.type, column.attrs.widget)
      // console.log(column.key, column.meta, column.attrs)

      // const record = this.record.getById(row.id)

      // const col_name = column.key
      // const nodes = this.node.children.filter(
      //   item => item.tagName === 'field' && item.attrs.name === col_name
      // )
      // const node = nodes[0]
      // const dataDict = row
      // const editable = this.editable

      // return h(OWidgetField, {
      //   props: { record, node, dataDict, editable }
      // })

      let fn = 'renderChar'

      const meta = this.record._columns[column.attrs.name]
      // console.log('renderCell', column.key, column, column.attrs, meta)

      if (column.attrs.widget === 'monetary') {
        fn = 'renderWidgetMonetary'
      } else if (meta.type === 'many2many') {
        fn = 'renderMany2many'
      } else if (meta.type === 'many2one') {
        fn = 'renderMany2one'
      } else if (meta.type === 'selection') {
        fn = 'renderSelection'
      } else if (meta.type === 'datetime') {
        fn = 'renderDatetime'
      } else if (meta.type === 'text') {
        fn = 'renderText'
      } else {
        fn = 'renderChar'
      }

      return this[fn](h, { row, column })
      // h('span', 'qq' + row[column.key])
    },

    renderText(h, { row, column }) {
      // return h(OWidgetField, {
      //   props: { record, node, dataDict, editable }
      // })
      return h('span', row[column.key] || '')
    },

    renderWidgetMonetary(h, { row, column }) {
      const val = row[column.key] || 0
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

    renderMany2many(h, { row, column }) {
      const val = row[column.key]
      const m2m_record = row[`${column.key}__record`]
      if (val.length) {
        const tocall = m2m_record.reduce((acc, cur) => {
          return acc || cur.display_name === undefined
        }, false)

        if (tocall) {
          const record = this.record.getById(row.id)
          record[`$$${column.key}`]
          // .then(res => {
          //   // console.log(res)
          //   // console.log(this.dataList2)
          // })
        }
      }

      const val2 = m2m_record.map(item => item.display_name)
      return h('span', val2)
    },

    renderDatetime(h, { row, column }) {
      const val = row[column.key]
      const val2 = val ? parseTime(val) : ''
      return h('span', val2)
    },

    renderChar(h, { row, column }) {
      return h('span', row[column.key] || '')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
