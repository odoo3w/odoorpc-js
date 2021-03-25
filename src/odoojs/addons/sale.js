import { Model } from '../models'

export class SaleOrder extends Model {
  constructor() {
    super()
  }

  static get metadata() {
    return {
      //
    }
  }

  get metadata() {
    return this.constructor.metadata
  }

  static async test_so() {
    console.log('test so')
  }

  form_view_header_buttons(header_node) {
    const header_buttons = super.form_view_header_buttons(header_node)

    // console.log('sale, ', header_buttons)

    // const header_buttons2 = header_node.children
    //   // .filter((item) => item.tagName === 'button' && !this.invisible(item))
    //   .map((item) => {
    //     return { ...item.attr }
    //   })
    // console.log('sale, ', header_buttons2)

    // {name: "authorized_transaction_ids", invisible: "1", can_create: "true", can_write: "true", modifiers: "{"invisible": true, "readonly": true}"}
    // 1: {name: "payment_action_capture", type: "object", string: "捕捉交易", class: "oe_highlight", attrs: "{'invisible': [('authorized_transaction_ids', '=', [])]}", …}
    // 2: {name: "payment_action_void", type: "object", string: "无效交易", confirm: "是否确定取消授权交易？此操作经确定后无法撤消。", attrs: "{'invisible': [('authorized_transaction_ids', '=', [])]}", …}
    // 3: {name: "312", string: "创建发票", type: "action", class: "btn-primary", attrs: "{'invisible': [('invoice_status', '!=', 'to invoice')]}", …}
    // 4: {name: "312", string: "创建发票", type: "action", context: "{'default_advance_payment_method': 'percentage'}", attrs: "{'invisible': ['|',('invoice_status', '!=', 'no'), ('state', '!=', 'sale')]}", …}
    // 5: {name: "action_quotation_send", string: "通过EMail发送", type: "object", states: "draft", class: "btn-primary", …}
    // 6: {name: "action_quotation_send", type: "object", string: "发送形式发票", class: "btn-primary", context: "{'proforma': True}", …}
    // 7: {name: "action_confirm", id: "action_confirm", string: "确认", class: "btn-primary", type: "object", …}
    // 8: {name: "action_confirm", string: "确认", type: "object", attrs: "{'invisible': [('state', 'not in', ['draft'])]}", modifiers: "{"invisible": [["state", "not in", ["draft"]]]}"}
    // 9: {name: "action_quotation_send", type: "object", string: "发送形式发票", context: "{'proforma': True}", invisible: "1", …}
    // 10: {name: "action_quotation_send", string: "通过EMail发送", type: "object", states: "sent,sale", modifiers: "{"invisible": [["state", "not in", ["sent", "sale"]]]}"}
    // 11: {name: "action_cancel", states: "draft,sent,sale", type: "object", string: "取消", modifiers: "{"invisible": [["state", "not in", ["draft", "sent", "sale"]]]}"}
    // 12: {name: "action_draft", states: "cancel", type: "object", string: "设为报价单", modifiers: "{"invisible": [["state", "not in", ["cancel"]]]}"}
    // 13: {name: "state", widget: "statusbar", statusbar_visible: "draft,sent,sale", on_change: "1", modifiers: "{"readonly": true}"}
    // length: 14

    const header_buttons3 = header_buttons.filter(
      (item) =>
        ![
          'payment_action_capture',
          'payment_action_void',
          'action_quotation_send',
        ].includes(item.name)
    )

    return header_buttons3
  }

  form_view_header_statusbar(header_node) {
    const header_statusbar = super.form_view_header_statusbar(header_node)
    //
    // console.log(' header_statusbar', header_statusbar)

    // sent

    const header_statusbar2 = header_statusbar.filter(
      (item) => item.value !== 'sent'
    )

    // console.log(' header_statusbar2', header_statusbar2)

    return header_statusbar2
  }
}

const AddonsModels = {
  'sale.order': SaleOrder,
}

export default AddonsModels
