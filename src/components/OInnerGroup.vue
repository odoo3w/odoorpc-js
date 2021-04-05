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
          :class="td.tagName === 'label' ? 'o_td_label' : undefined"
        >
          <div v-if="td.tagName === 'separator'" class="o_horizontal_separator">
            {{ td.attribute.attrs.string }}
          </div>
          <!-- <label
            v-else-if="td.tagName === 'label' && td.meta.string"
            :for="td.attribute.attrs.for"
            :class="classNameLabel(td)"
          >
            {{ td.meta.string }}
          </label> -->
          <label
            v-else-if="td.tagName === 'label'"
            :class="classNameLabel(td)"
            :for="td.attribute.attrs.for"
            :name="td.attribute.attrs.name"
          >
            <span v-if="td.meta.string"> {{ td.meta.string }} </span>
            <span v-else>
              <OFormNodeJS
                v-for="(child_of_label, index3) in td.children"
                :key="index3"
                :node="child_of_label"
              />
            </span>
          </label>
          <OFormNodeJS v-else :node="td" />

          <!-- <div v-else>
           
            {{ td.tagName }}
          </div> -->
          <!-- {{ td }} -->
        </td>
      </tr>
    </tbody>
    <!-- <div>table {{ level }} end</div> -->
  </table>
</template>

<script>
const deep_copy = node => {
  return JSON.parse(JSON.stringify(node))
}

import OFormNodeJS from '@/components/OFormNodeJS.js'

export default {
  name: 'OInnerGroup',
  components: {
    OFormNodeJS
  },

  mixins: [],
  props: {
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

        while (children.length) {
          const child = children.shift()
          // console.log(child)

          if (child.tagName === 'label') {
            const ch_value = children.shift()
            matrix.push([child, ch_value])
          } else if (child.tagName === 'field') {
            if (child.attribute.attrs.nolabel) {
              matrix.push([child])
            } else {
              const nd_label = {
                attribute: { attrs: { for: child.attribute.attrs.name } },
                meta: child.meta,
                tagName: 'label'
              }
              matrix.push([nd_label, child])
            }
          } else {
            matrix.push([child])
          }
        }

        return matrix
      }

      const node_table = get_matrix()

      return node_table
    }
  },
  async created() {
    // console.log('OGroup Inner, xxxxxx:', this.seq, deep_copy(this.node))
  },

  methods: {
    //

    styleNameTd(node) {
      //  colspan = null, 50%
      //  colspan =2, 100%
      //  colsapn =4, 200%
      //  TBD

      if (node.tagName !== 'label') {
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

        return `width: ${50 * x}%`
      }

      // if (node.attribute.attrs.colspan) {
      //   return `width: ${100}%`
      // }

      // if (node.tagName === 'field') {
      //   return `width: ${100}%`
      // }
      return undefined
    },
    classNameLabel(node) {
      const classList = [
        'o_form_label',
        ...(node.attribute.class ? node.attribute.class.split(' ') : [])
      ]

      if (node.meta.invisible) {
        classList.push('o_invisible_modifier')
      }
      // Label readonly TBD
      if (node.meta.readonly) {
        classList.push('o_readonly_modifier')
      }
      if (node.meta.required) {
        classList.push('o_required_modifier')
      }

      if (!node.meta.value) {
        classList.push('o_form_label_empty')
      }

      return classList.join(' ')
    },
    test(row, index) {
      // const matrix = this.matrix

      console.log(index, row[0].label, row[0].value)
      return []
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
