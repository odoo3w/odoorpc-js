import { expect, assert } from 'chai'

import { USER, get_odoo } from './config'

import { Environment } from '@/odoojs/env'
import { Model } from '@/odoojs/models'

describe('field read', async () => {
  it('char', async () => {
    const odoo = await get_odoo()
    const user = await odoo.env.user
    expect(user.$login).to.be.equal(USER)
  })
  it('boolean', async () => {
    const odoo = await get_odoo()
    const user = await odoo.env.user
    expect(user.$active).to.be.true
  })
  it('image', async () => {
    const odoo = await get_odoo()
    const user = await odoo.env.user
    const img = user.$image_128
    // how to check it
    console.log(img)
    // expect(user.$active).to.be.true
  })
  it('date', async () => {
    const odoo = await get_odoo()
    const Model = odoo.env.model('ir.sequence.date_range')
    const obj_ids = await Model.search([])
    const objs = await Model.browse(obj_ids)
    console.log(objs.$date_from)
    console.log(objs.$date_to)
    expect(objs.$date_from).to.be.an.instanceof(Date)
  })

  it('datetime', async () => {
    const odoo = await get_odoo()
    const user = await odoo.env.user
    console.log(user.$create_date)
    expect(user.$create_date).to.be.an.instanceof(Date)
  })

  it('float', async () => {
    const odoo = await get_odoo()
    const user = await odoo.env.user
    // console.log(user.$credit_limit)
    expect(user.$credit_limit).to.be.equal(0.0)
  })

  it('int', async () => {
    const odoo = await get_odoo()
    const user = await odoo.env.user
    // console.log(user.$color)
    expect(user.$color).to.be.equal(0)
  })
  it('text', async () => {
    const odoo = await get_odoo()
    const user = await odoo.env.user
    expect(user.$comment).to.be.false

    const Module = odoo.env.model('ir.module.module')
    const sale_id = await Module.search([['name', '=', 'sale']])
    const sale_mod = await Module.browse(sale_id)
    const sss = typeof sale_mod.$views_by_module
    expect(sss).to.be.equal('string')
  })
  it('selection', async () => {
    const odoo = await get_odoo()
    const user = await odoo.env.user
    // console.log(user.$color)
    expect(user.$state).to.be.equal('active')
  })
})

describe('model', async () => {})

describe('model', async () => {})
