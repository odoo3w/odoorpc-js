<template>
  <div>
    <div>
      <div>
        {{ dataDict }}
      </div>
      <OViewForm :record="record" :node="node" :editable="false" />

      <div>&nbsp;</div>
      <div>
        asdadsa
        {{ dataDict }}
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api'

import OViewForm from '@/components/OViewForm'

export default {
  name: 'ViewPage',
  components: { OViewForm },
  mixins: [],

  data() {
    return {
      api,

      record: {},
      node: {},
      dataDict: {}
    }
  },
  computed: {},
  async created() {
    const query = this.$route.query
    const model = query.model
    const views = JSON.parse(query.views)
    const view_type = 'form'
    const view_ref = views[view_type].view_ref

    const rid = Number(query.id)
    console.log('view 1', model, view_type, view_ref, rid)
    const Model = api.env.model(model, view_type, view_ref)

    const deep_copy = node => {
      return JSON.parse(JSON.stringify(node))
    }

    const callback = res => {
      console.log('call back,', deep_copy(res))
      this.dataDict = { ...res }
    }

    const record = await Model.browse(rid, { fetch_one: callback })

    console.log('view 2', model, view_type, view_ref)
    const node = record.view_node()
    // console.log('view node,', node)
    this.node = node
    this.record = record
    console.log('view 3', model, view_type, view_ref, this.node, this.record)
  },

  methods: {}
}
</script>

<style type="text/css"></style>
