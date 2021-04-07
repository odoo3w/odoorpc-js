<template>
  <table :class="className">
    <!-- <div>table {{ level }} start</div> -->
    <tbody>
      <tr v-for="(row, index) in matrix" :key="index">
        <td
          v-for="(td, index2) in row"
          :key="index2"
          :colspan="td.attribute.attrs.colspan"
          :style="styleNameTd(td)"
          :class="
            td.tagName === 'label' || td.attribute.class === 'o_td_label'
              ? 'o_td_label'
              : undefined
          "
        >
          <div v-if="td.tagName === 'separator'" class="o_horizontal_separator">
            {{ td.attribute.attrs.string }}
          </div>

          <div
            v-else-if="
              td.tagName === 'div' && td.attribute.class === 'o_td_label'
            "
            :class="td.meta.invisible ? 'o_invisible_modifier' : undefined"
          >
            <OFormLabel
              v-for="(child_of_label, index3) in td.children"
              :key="index3"
              :node="child_of_label"
            />
          </div>

          <OFormLabel v-else-if="td.tagName === 'label'" :node="td" />

          <ONode v-else :record="record" :node="td" :editable="editable" />
        </td>
      </tr>
    </tbody>
    <!-- <div>table {{ level }} end</div> -->
  </table>
</template>

<script>
import OFormLabel from '@/components/OFormLabel'
import ONode from '@/components/ONodeRender'

export default {
  name: 'OInnerGroup',
  components: { OFormLabel, ONode },

  mixins: [],
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
    },

    level: { type: Number, default: 0 }
  },

  computed: {
    className() {
      const classList = ['o_group', 'o_inner_group']
      if (this.level) {
        classList.push(`o_group_col_${this.level * 6}`)
      }

      const node = this.node

      if (node.meta.invisible) {
        classList.push('o_invisible_modifier')
      }

      return classList.join(' ')
    },

    matrix() {
      const node_group = this.node

      const get_matrix = () => {
        const matrix = []

        if (node_group.attribute.attrs.string) {
          const separator = {
            attribute: {
              attrs: { colspan: 2, string: node_group.attribute.attrs.string }
            },
            tagName: 'separator'
          }

          matrix.push([separator])
        }

        const children = [...node_group.children]
        let count = 2 - this.level
        let row = []

        while (children.length) {
          const child = children.shift()
          if (
            child.tagName === 'label' ||
            child.attribute.class === 'o_td_label'
          ) {
            const ch_value = children.shift()
            row.push(child)
            row.push(ch_value)
          } else if (child.tagName === 'field') {
            if (child.attribute.attrs.nolabel) {
              row.push(child)
            } else {
              const nd_label = {
                attribute: { attrs: { for: child.attribute.attrs.name } },
                meta: child.meta,
                tagName: 'label'
              }
              row.push(nd_label)
              row.push(child)
            }
          } else {
            row.push(child)
          }
          count = count - 1
          if (!count) {
            matrix.push(row)
            row = []
            count = 2 - this.level
          }
        }

        if (row.length) {
          matrix.push(row)
        }

        return matrix
      }

      const node_table = get_matrix()
      // console.log('node_table', deep_copy(node_table))

      return node_table
    }
  },
  async created() {
    // const deep_copy = node => {
    //   return JSON.parse(JSON.stringify(node))
    // }
    // console.log('OInnerGroup , xxxxxx:', this.seq, deep_copy(this.node))
  },

  methods: {
    //

    styleNameTd(node) {
      //  colspan = null, 50%
      //  colspan =2, 100%
      //  colsapn =4, 200%
      //  TBD

      if (node.tagName !== 'label' && node.attribute.class !== 'o_td_label') {
        const compute_x = () => {
          if (node.attribute.attrs.colspan) {
            return node.attribute.attrs.colspan
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
