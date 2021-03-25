import { Model } from '../models'

export class ResPartner extends Model {
  constructor() {
    super()
  }

  _view_node_button_box_item(button_box_item) {
    const item_field1 = button_box_item.children[0].children[0].children[0]
    console.log(item_field1.attr.widget)
    const item_field = {
      ...item_field1,
      attr: {
        ...item_field1.attr,
        string: button_box_item.children[0].children[1].content,
        widget: `${item_field1.attr.widget !== 'statinfo' ? 'statinfo' : ''},${
          item_field1.attr.widget
        }`,
      },
    }

    return {
      ...button_box_item,
      children: [item_field],
    }
  }

  _view_node_button_box(node_sheet) {
    //

    const button_box1 = node_sheet.children[0]

    return {
      ...button_box1,
      children: [
        button_box1.children[0],
        button_box1.children[1],
        this._view_node_button_box_item(button_box1.children[2]),
        button_box1.children[3],
        this._view_node_button_box_item(button_box1.children[4]),
      ],
    }
  }

  view_node2(xml_node) {
    const node1 = super.view_node(xml_node)

    const node_sheet1 = node1.children[1]

    const button_box = this._view_node_button_box(node_sheet1)
    // const  web_ribbon1 = node_sheet1.children[1]
    const avatar = node_sheet1.children[2]
    const sheet_title = node_sheet1.children[3]
    const sheet_group = node_sheet1.children[4]
    const notebook = node_sheet1.children[5]

    const node_sheet = {
      ...node_sheet1,
      children: [button_box, avatar, sheet_title, sheet_group, notebook],
    }

    const node = {
      ...node1,
      //   only sheet ok
      children: [node_sheet],
    }

    console.log('ptn,', node)

    return node
  }
}

const AddonsModels = {
  'res.partner': ResPartner,
}

export default AddonsModels
