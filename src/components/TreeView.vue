<template>
  <div>
    <div>页面标题: {{ viewInfo.arch.attr.string }}</div>
    <ul>
      <li v-for="rec in dataList" :key="rec.id">
        <div>------</div>
        <span> ID: {{ rec.id }} </span>
        <span v-for="node in viewInfo.arch.children" :key="node.attr.name">
          <div
            v-if="
              !node.attr.invisible &&
                node.attr.optional !== 'hide' &&
                node.attr.widget !== 'activity_exception'
            "
          >
            {{ node.attr.string || viewInfo.fields[node.attr.name].string }}:
            <span
              v-if="
                ['many2one', 'selection'].includes(
                  viewInfo.fields[node.attr.name].type
                )
              "
            >
              {{ rec[`${node.attr.name}__name`] }}
            </span>
            <span v-else> {{ rec[node.attr.name] }} </span>
          </div>
        </span>
      </li>
    </ul>
    <div></div>
  </div>
</template>

<script>
export default {
  name: 'TreeView',
  props: {
    viewInfo: {
      type: Object,
      default: () => {
        return {}
      }
    },
    dataList: { type: Array, default: () => [] }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
