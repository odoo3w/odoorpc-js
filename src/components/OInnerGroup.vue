<template>
  <table :class="className">
    <tbody>
      <tr v-for="(row, index) in matrix" :key="index">
        <td class="o_td_label">
          <FormLabel :node="row[0].label" />
        </td>

        <td :style="col_6 ? 'width: 100%' : 'width: 50%'">
          <FormNode :node="row[0].value" />
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
const deep_copy = (node) => {
  return JSON.parse(JSON.stringify(node))
}

import FormLabel from '@/components/FormLabel.js'
import FormNode from '@/components/FormNode.js'

export default {
  name: 'OGroup',
  components: { FormLabel, FormNode },

  mixins: [],
  props: {
    node: {
      type: Object,
      default: () => {
        return { children: [] }
      },
    },

    seq: { type: String, default: '' },
    col_6: { type: Boolean, default: false },
  },

  computed: {
    className() {
      if (this.col_6) {
        const classList = ['o_group', 'o_inner_group', 'o_group_col_6']
        return classList.join(' ')
      }

      const node = this.node
      let classList = [
        'o_group',
        'o_inner_group',
        // ...(node.attribute.class ? node.attribute.class.split(' ') : []),
      ]

      if (node.meta.invisible) {
        classList.push('o_invisible_modifier')
      }

      return classList.join(' ')
    },

    matrix() {
      const node_group = this.node
      const get_matrix = (fields, col_count) => {
        //
        const loop_res = fields.reduce(
          (acc, node) => {
            const { matrix, last_row, last_item } = acc
            let new_matrix = [...matrix]
            let new_row = last_row ? [...last_row] : []
            let new_item = last_item ? { ...last_item } : {}

            // console.log('xxxxx,', new_matrix, new_row, new_item)

            if (!new_item.label) {
              if (node.tagName === 'field') {
                // vue 做 v-for, 使用这个 label 之后, 会 改变他,
                // 导致 我们再用 value 时, 就出错了
                // 因此 label 必须复制一份, 而不是 和 value 是同一个对象
                // 2021-3-31
                //
                new_item = { label: deep_copy(node), value: node }
              } else if (node.tagName === 'label') {
                new_item = { label: node }
              } else {
                throw 'error group.children, expect label, but not'
              }
            } else {
              if (node.tagName === 'field') {
                if (node.attr.nolabel) {
                  new_item = { ...new_item, value: node }
                } else {
                  throw 'error group.children, expect only value'
                }
              } else if (node.tagName === 'label') {
                //
                throw 'error  group.children, expect value, but label'
              } else {
                new_item = { ...new_item, value: node }
              }
            }

            if (new_item.label && new_item.value) {
              new_row = [...new_row, new_item]
              new_item = null
            }

            if (new_row.length === col_count / 2) {
              new_matrix = [...new_matrix, new_row]
              new_row = null
              new_item = null
            }
            acc = { matrix: new_matrix, last_row: new_row, last_item: new_item }
            return acc
          },
          { matrix: [], last_row: null, last_item: null }
        )
        const matrix = loop_res.matrix
        const part_matrix = loop_res.last_row ? [loop_res.last_row] : []
        return [...matrix, ...part_matrix]
      }

      if (this.col_6) {
        const node_table = get_matrix(node_group.children, 2)

        console.log('node_table ', deep_copy(node_table))

        return node_table
      } else {
        return []
      }
    },
  },
  async created() {
    console.log('OGroup Inner, xxxxxx:', this.seq, deep_copy(this.node))
  },

  methods: {
    //
    test(row, index) {
      // const matrix = this.matrix

      console.log(index, row[0].label, row[0].value)
      return []
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
