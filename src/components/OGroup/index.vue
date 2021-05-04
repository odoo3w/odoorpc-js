<template>
  <OInnerGroup
    v-if="is_inner_group && level > 0"
    :record="record"
    :dataDict="dataDict"
    :node="node"
    :name="node.attrs.name"
    :col="node.attrs.col"
    :parentCol="parentCol"
    :colspan="node.attrs.colspan"
    :editable="editable"
    :level="level"
  />
  <div v-else-if="is_inner_group && level === 0" :class="className">
    <OInnerGroup
      :record="record"
      :node="node"
      :name="node.attrs.name"
      :parentCol="parentCol"
      :col="node.attrs.col"
      :colspan="node.attrs.colspan"
      :dataDict="dataDict"
      :editable="editable"
      :level="level"
    />
  </div>
  <div
    v-else
    :class="className"
    :name="node.attrs.name"
    :col="node.attrs.col"
    :colspan="node.attrs.colspan"
  >
    <!-- <div>Group {{ level }} Satrt</div> -->
    <!-- v-if="node.tagName === 'group'" -->
    <div v-for="(child, index) in node.children" :key="index">
      <OGroup
        v-if="child.tagName === 'group'"
        :record="record"
        :node="child"
        :parentCol="node.attrs.col || 2"
        :name="child.attrs.name"
        :col="child.attrs.col"
        :colspan="child.attrs.colspan"
        :dataDict="dataDict"
        :editable="editable"
        :level="level + 1"
      />
      <ONode
        v-else
        :record="record"
        :node="child"
        :dataDict="dataDict"
        :editable="editable"
      />
    </div>

    <!-- <div>Group {{ level }} End</div> -->
  </div>
</template>

<script>
import ONodeMixin from '@/components/ONodeMixin'

import OInnerGroup from '@/components/OGroup/OInnerGroup'
import ONode from '@/components/ONodeRender'

// 大group 默认col =2, 即: 分为两个儿子
// 儿子 多数是 group, 但有例外
// 每个 儿子  默认 colspan =1
// 每个 儿子 o_group_col${ 12 / col * colspan }
//

export default {
  name: 'OGroup',
  components: { OInnerGroup, ONode },

  mixins: [ONodeMixin],
  props: {
    level: { type: Number, default: 0 },
    parentCol: { type: [Number, String], default: 2 }
  },

  computed: {
    is_inner_group() {
      const node = this.node
      return (
        node.children &&
        node.children.length &&
        node.children[0].tagName !== 'group'
      )
    },

    className() {
      const classList = ['o_group']
      // if (this.level) {
      //   const col_num = (12 / this.parentCol) * (this.node.attrs.colspan || 1)
      //   classList.push(`o_group_col_${col_num}`)
      // }

      if (this.level) {
        classList.push(`o_group_col_${this.level * 6}`)
      } else {
        classList.push('o_group_col_6')
      }

      return classList.join(' ')
    }
  },
  async created() {
    const deep_copy = node => {
      return JSON.parse(JSON.stringify(node))
    }
    console.log('OGroup, xxxxxx:', deep_copy(this.node))
  },

  methods: {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
