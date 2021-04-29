<template>
  <Form label-position="left" :class="className" :label-width="120">
    <span v-for="(row, index) in group_items" :key="index">
      <div v-if="row.tagName === 'separator'" class="o_horizontal_separator">
        {{ row.attrs.string }}
      </div>

      <FormItem
        v-else-if="row.tagName === 'form-item'"
        :class="classNameItem(row)"
        :label="row.attrs.string"
        :label-for="input_id(row)"
      >
        <OFormLabel
          slot="label"
          v-if="
            row.children[0].tagName === 'label' &&
              row.children[0].children &&
              row.children[0].children.length
          "
          :record="record"
          :node="row.children[0]"
        />

        <ONode
          a-test-input
          :record="record"
          :dataDict="dataDict"
          :node="row.children[row.children.length - 1]"
          :editable="editable"
        />
      </FormItem>

      <ONode
        v-else
        :record="record"
        :dataDict="dataDict"
        :node="row"
        :editable="editable"
      />
    </span>
  </Form>
  <!-- by table,   to del -->
  <!-- <div>table {{ level }} start</div> -->
  <!-- <table :class="className">
    <tbody>
      <tr v-for="(row, index) in matrix" :key="index">
        <td
          v-for="(td, index2) in row"
          :key="index2"
          :colspan="td.attribute.attrs.colspan"
          :style="styleNameTd(td)"
          :class="td.tagName === 'label' ? 'o_td_label' : undefined"
        >
          <div v-if="td.tagName === 'separator'" class="o_horizontal_separator">
            {{ td.attribute.attrs.string }}
          </div>

          <OFormLabel v-else-if="td.tagName === 'label'" :node="td" />
          <ONode v-else :record="record" :node="td" :editable="editable" />
        </td>
      </tr>
    </tbody>
  </table> -->
  <!-- <div>table {{ level }} end</div> -->
</template>

<script>
import ONodeMixin from '@/components/ONodeMixin'

import OFormLabel from '@/components/OFormLabel'
import ONode from '@/components/ONodeRender'

export default {
  name: 'OInnerGroup',
  components: { OFormLabel, ONode },

  mixins: [ONodeMixin],
  props: {
    level: { type: Number, default: 0 }
  },

  data() {
    return {}
  },

  computed: {
    className() {
      const classList = ['o_group', 'o_inner_group']
      if (this.level) {
        classList.push(`o_group_col_${this.level * 6}`)
      } else {
        classList.push('o_group_col_6')
      }

      if (this.invisible_modifier) {
        classList.push('o_invisible_modifier')
      }

      return classList.join(' ')
    },

    matrix() {
      const items = this.group_items
      return items.map(item => {
        return item.tagName === 'form-item' ? item.children : [item]
      })
    },

    group_items() {
      const node_group = this.node

      const get_matrix = () => {
        const matrix = []

        if (node_group.attrs.string) {
          const separator = {
            attrs: { colspan: 2, string: node_group.attrs.string },
            tagName: 'separator'
          }

          matrix.push(separator)
        }

        const children = [...node_group.children]
        // let count = 2 - this.level
        let row = []

        while (children.length) {
          const child = children.shift()
          if (child.tagName === 'label') {
            const ch_value = children.shift()
            row.push(child)
            // ch_value.meta.string = child.meta.string
            row.push(ch_value)
          } else if (child.class === 'o_td_label') {
            const ch_value = children.shift()
            row.push(child.children[0])
            row.push(ch_value)
          } else if (child.tagName === 'field') {
            if (child.attrs.nolabel) {
              row.push(child)
            } else {
              const nd_label = {
                attrs: { for: child.attrs.name, ...child.attrs },
                tagName: 'label'
              }
              row.push(nd_label)
              row.push(child)
            }
          } else {
            row.push(child)
          }
          // count = count - 1
          // if (!count) {
          // matrix.push(row)
          // row = []
          //   count = 2 - this.level
          // }

          if (row.length === 1) {
            matrix.push(row[0])
          } else if (row.length === 2) {
            matrix.push({
              attrs: { ...row[0].attrs },
              children: row,
              tagName: 'form-item'
            })
          }

          row = []
        }

        // if (row.length) {
        //   matrix.push(row)
        // }

        return matrix
      }

      const node_table = get_matrix()
      // const deep_copy = node => {
      //   return JSON.parse(JSON.stringify(node))
      // }
      // console.log('node_table', deep_copy(node_table))

      // const node_table2 = node_table.filter(item =>
      //   ['title', 'category_id'].includes(item.children[1].meta.name)
      // )

      return node_table
    }
  },
  async created() {
    // const deep_copy = node => {
    //   return JSON.parse(JSON.stringify(node))
    // }
    // console.log(
    //   'OInnerGroup , xxxxxx:',
    //   deep_copy(this.group_items),
    //   deep_copy(this.node)
    // )
    // // console.log(this.record)
  },

  methods: {
    input_id(row) {
      // console.log('Label: input_id  ', row.attrs.for)
      if (row.attrs.for) {
        const meta = this.record._columns[row.attrs.name]
        // console.log('Label: input_id  ', row.attrs.for, meta)
        if (meta) {
          return meta.getInputId(this.record)
        }
      }
      return undefined
    },
    classNameItem(row) {
      const invisible_modifier = this.record._view_invisible(row, this.dataDict)
      if (invisible_modifier) {
        return 'o_invisible_modifier'
      }

      return undefined
    },

    styleNameTd(node) {
      //  colspan = null, 50%
      //  colspan =2, 100%
      //  colsapn =4, 200%
      //  TBD

      if (node.tagName !== 'label' && node.class !== 'o_td_label') {
        const compute_x = () => {
          if (node.attrs.colspan) {
            return node.attrs.colspan
          } else if (this.level) {
            return 2
          } else {
            return 1
          }
        }

        const x = compute_x()
        const x2 = x / (node.meta.type === 'many2one' ? 3 / 2 : 1)
        return `width: ${50 * x2}%`
      }

      return undefined
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
