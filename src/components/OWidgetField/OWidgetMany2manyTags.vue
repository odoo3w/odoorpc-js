<template>
  <span>
    <Tag v-for="one in dataList" :key="one.id"> {{ one.name }} </Tag>
    <!-- <span
    :class="className"
    :name="node.attribute.attrs.name"
    :placeholder="node.attribute.attrs.placeholder"
  >
    {{ node.meta.valueName }}
  </span> -->
  </span>
</template>

<script>
import OFieldMixin from './OFieldMixin'
export default {
  name: 'OFieldMany2many',
  mixins: [OFieldMixin],
  props: {},
  data() {
    return {
      dataList: []
    }
  },
  computed: {},
  async created() {
    // const deep_copy = node => {
    //   return JSON.parse(JSON.stringify(node))
    // }
    // console.log(
    //   'OWidget M2M xxxxxx:',
    //   this.node.meta.name,
    //   deep_copy(this.node)
    // )

    // console.log(this.record)

    await this.init()
  },

  methods: {
    async init() {
      const m2m_record = await this.record[`$$${this.node.meta.name}`]
      // const m2m_record = this.record[`$${this.node.meta.name}`]
      // console.log('m2m, ', this.node.meta.name, m2m_record)
      const dataList = m2m_record.fetch_all()
      this.dataList = dataList
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
