import { expect, assert } from 'chai'

import { get_odoo } from './config.js'

import { Environment } from '@/odoojs/env.js'
import { Model } from '@/odoojs/models.js'

describe('sale.order', async () => {
  // it('test_field_onchange', async () => {
  //   const odoo = await get_odoo()
  //   const SO = odoo.env.model('sale.order')
  //   const view_ref = 'sale.view_order_form'
  //   const field_onchange = await SO._get_field_onchange(view_ref)
  //   expect(field_onchange).to.include.keys('order_line')
  //   expect(field_onchange.order_line).to.be.equal('1')
  //   expect(field_onchange).to.include.keys('state')
  //   expect(field_onchange.state).to.be.equal('1')
  //   expect(field_onchange).to.include.keys('name')
  //   expect(field_onchange.name).to.be.equal('')
  //   expect(field_onchange).to.include.keys('order_line.price_unit')
  //   expect(field_onchange['order_line.price_unit']).to.be.equal('1')
  //   expect(field_onchange).to.include.keys('order_line.price_subtotal')
  //   expect(field_onchange['order_line.price_subtotal']).to.be.equal('')
  // })
  // it('new a sale order', async () => {
  //   const odoo = await get_odoo()
  //   const SO = odoo.env.model('sale.order')
  //   const view_ref = 'sale.view_order_form'
  //   const so = await SO.browse(null, { view_ref })
  // })
  // it('edit a sale order', async () => {
  //   const odoo = await get_odoo()
  //   const SO = odoo.env.model('sale.order')
  //   const view_ref = 'sale.view_order_form'
  //   const so_ids = await SO.search([])
  //   const so = await SO.browse(so_ids, { view_ref })
  //   const partner = await so.$partner_id
  //   // console.log(partner.id)
  //   expect(partner.id).to.be.equal(1)
  //   const selection = await SO.get_selection('partner_id')
  //   const pids = selection.map(item => item[0])
  //   expect(pids).to.include(3)
  //   const pi_old = await so.$partner_invoice_id
  //   so.$note = 'wewerwer'
  //   so.$partner_id = 3
  //   // // console.log(ss)
  //   await so.awaiter
  //   const pi_new = await so.$partner_invoice_id
  //   expect(pi_new.id).to.be.not.equal(pi_old.id)
  //   // so onchange ok
  //   // console.log(pi_old.id, pi_new.id)
  //   // // console.log(ss)
  // })
  // it('edit sale order line', async () => {
  //   const odoo = await get_odoo()
  //   const SO = odoo.env.model('sale.order')
  //   const view_ref = 'sale.view_order_form'
  //   const so_ids = await SO.search([])
  //   const so = await SO.browse(so_ids, { view_ref })
  //   const amount_total = so.$amount_total
  //   console.log('amount_total1', amount_total)
  //   const sols = await so.$order_line
  //   const sol1 = sols.getByIndex(0)
  //   const price_subtotal = sol1.$price_subtotal
  //   const price = sol1.$price_unit
  //   sol1.$price_unit = price + 0.1
  //   await sol1.awaiter
  //   console.log('amount_total2', so.$amount_total)
  //   expect(sol1.$price_subtotal).to.be.not.equal(price_subtotal)
  //   expect(so.$amount_total).to.be.not.equal(amount_total)
  //   const amount_total2 = so.$amount_total
  //   await so.commit()
  //   expect(so.$amount_total).to.be.equal(amount_total2)
  //   console.log('amount_total3', so.$amount_total)
  //   // const so_ids1 = await SO.search([])
  //   // const so1 = await SO.browse(so_ids1)
  //   // expect(so1.$amount_total).to.be.equal(amount_total2)
  // })
  // it('edit sale order line', async () => {
  //   const odoo = await get_odoo()
  //   const SO = odoo.env.model('sale.order')
  //   const view_ref = 'sale.view_order_form'
  //   const so_ids = await SO.search([])
  //   const so = await SO.browse(so_ids, { view_ref })
  //   const amount_total = so.$amount_total
  //   console.log('amount_total1', amount_total)
  //   const sols = await so.$order_line
  //   const sol1 = sols.getByIndex(0)
  //   const price_subtotal = sol1.$price_subtotal
  //   const price = sol1.$price_unit
  //   sol1.$price_unit = price + 0.1
  //   await sol1.awaiter
  //   console.log('amount_total2', so.$amount_total)
  //   expect(sol1.$price_subtotal).to.be.not.equal(price_subtotal)
  //   expect(so.$amount_total).to.be.not.equal(amount_total)
  //   const amount_total2 = so.$amount_total
  //   await so.commit()
  //   expect(so.$amount_total).to.be.equal(amount_total2)
  //   console.log('amount_total3', so.$amount_total)
  //   // const so_ids1 = await SO.search([])
  //   // const so1 = await SO.browse(so_ids1)
  //   // expect(so1.$amount_total).to.be.equal(amount_total2)
  // })
})
