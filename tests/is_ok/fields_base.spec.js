import { expect, assert } from 'chai'

import { get_odoo } from './config.js'

import { Environment } from '@/odoojs/env.js'
import { Model } from '@/odoojs/models.js'

describe('field', async () => {
  // it('test_merge_one', async () => {
  //   const { merge_tuples_one } = fields_for_test
  //   const old = [
  //     [4, 6, 0],
  //     [4, 7, 0],
  //     [0, 'v_1', { name: 'n1' }]
  //   ]
  //   const tup = [0, 'v_1', { name: 'n2' }]
  //   const ret = merge_tuples_one(old, tup)
  //   console.log(ret)
  // })
  // it('test_merge', async () => {
  //   const { merge_tuples } = fields_for_test
  //   const old = [
  //     [4, 6, 0],
  //     [4, 7, 0],
  //     [0, 'v_1', { name: 'n1' }]
  //   ]
  //   const tuples = [[0, 'v_1', { name: 'n2' }]]
  //   const ret = merge_tuples(old, tuples)
  //   console.log(ret)
  // })

  it('test_get values for onchange', async () => {
    // const odoo = await get_odoo()
    // const allowed_company_ids = odoo.allowed_company_ids
    // const SO1 = odoo.env.model('sale.order')
    // const SO = SO1.with_context({ ...SO1.env.context, allowed_company_ids })
    // // // const view_form_xml_id = 'sale_order'
    // const view_form_xml_id = 'sale.view_order_form'
    // const so_ids = await SO.search([])
    // const so = await SO.browse(so_ids, { view_form_xml_id })
    // const sols = await so.$order_line
    // const sol_new = await sols.new()
    // console.log('so.values', so._values.order_line)
    // console.log('sols', sols.ids)
    // console.log('sol_new', sol_new)
    // const prd_selection = await so.get_selection('order_line.product_id')
    // console.log('prd_selection', prd_selection)
    // console.log('prd_selection', prd_selection[0][0])
    // // 1st Manual Set product_id
    // sol_new._values_to_write.product_id[sol_new.id] = 1
    // // 2nd set so.order_line
    // sol_new._update_parent()
    // // 3rd to set values_for_onchange
    // const values = sol_new._get_values_for_onchange()
    // console.log('sol_new._get_values_for_onchange', values)
    // // 3rd to set values_for_onchange
    // const parent_values = so._get_values_for_onchange({ for_parent: true })
    // console.log('sol_new.so._get_values_for_onchange', parent_values)
  })

  it('new sale order line', async () => {
    // const odoo = await get_odoo()
    // const allowed_company_ids = odoo.allowed_company_ids
    // const SO1 = odoo.env.model('sale.order')
    // const SO = SO1.with_context({ ...SO1.env.context, allowed_company_ids })
    // // // const view_form_xml_id = 'sale_order'
    // const view_form_xml_id = 'sale.view_order_form'
    // const so_ids = await SO.search([])
    // const so = await SO.browse(so_ids, { view_form_xml_id })
    // const sols = await so.$order_line
    // const sol_new = await sols.new()
    // console.log('so.values', so._values.order_line)
    // console.log('sols', sols.ids)
    // console.log('sol_new', sol_new)
    // const prd_selection = await so.get_selection('order_line.product_id')
    // console.log('prd_selection', prd_selection)
    // console.log('prd_selection', prd_selection[0][0])
    // sol_new.$product_id = prd_selection[0][0]
    // await sol_new.awaiter
    // // 查看  onchange 的结果
    // console.log('so._values.order_line', so._values.order_line)
    // console.log(
    //   'so._values_to_write.order_line',
    //   so._values_to_write.order_line
    // )
    // await so.commit()
    // const sols2 = await so.$order_line
    // console.log('sols2', sols2.ids)
  })

  // it('test_field_onchange', async () => {
  //   const odoo = await get_odoo()
  //   const SO = odoo.env.model('sale.order')
  //   const view_form_xml_id = 'sale.view_order_form'
  //   const field_onchange = await SO._get_field_onchange(view_form_xml_id)
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
  // it('edit sale order line', async () => {
  //   const odoo = await get_odoo()
  //   const SO = odoo.env.model('sale.order')
  //   const view_form_xml_id = 'sale.view_order_form'
  //   const so_ids = await SO.search([])
  //   const so = await SO.browse(so_ids, { view_form_xml_id })
  //   const amount_total = so.$amount_total
  //   console.log('amount_total1', amount_total)
  //   const sols = await so.$order_line
  //   const sol1 = sols.slice(0, 1)
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
