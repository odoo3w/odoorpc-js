import OWidgetField from '@/components/OWidgetField.vue'
import OWidgetStatinfo from '@/components/OWidgetStatinfo.vue'
import OWidgetMonetary from '@/components/OWidgetMonetary.vue'

import OWidgetStatusbar from '@/components/OWidgetStatusbar.vue'

export default {
  name: 'WidgetField',
  components: {
    OWidgetField,
    OWidgetStatinfo,
    OWidgetMonetary,
    OWidgetStatusbar,
  },

  mixins: [],
  props: {
    node: {
      type: Object,
      default: () => {
        return { children: [] }
      },
    },
  },

  computed: {},

  render(createElement) {
    const node = this.node

    const deep_copy = (node) => {
      return JSON.parse(JSON.stringify(node))
    }
    // console.log(' js field widget, 222 ', node, node.attribute.attrs.widget)

    let tagName = 'div'
    if (node.attribute.attrs.widget === 'statusbar') {
      tagName = 'OWidgetStatusbar'
    } else if (node.attribute.attrs.widget === 'monetary') {
      tagName = 'OWidgetMonetary'
    } else if (node.attribute.attrs.widget === 'statinfo') {
      tagName = 'OWidgetStatinfo'
    } else {
      tagName = 'OWidgetField'
    }

    return createElement(tagName, { props: { node } })

    // return createElement(
    //   'OWidgetField',
    //   { props: { node: node } },
    //   ['field']
    //   // node.children.map((item) => {
    //   //   if (item.name === 'field') {
    //   //     return createElement('WidgetField', { props: { node: item } }, [])
    //   //   } else {
    //   //     return createElement('div', {}, [item.name])
    //   //   }
    //   // })
    // )
  },

  methods: {},
}
