import { expect, assert } from 'chai'

import { BASE_URL, DB, USER, PSW, get_odoo } from './config'

import { Environment } from '@/odoojs/env'
import { Model } from '@/odoojs/models'

describe('env', () => {
  it('init', async () => {
    const odoo = await get_odoo()
    expect(odoo.env).to.be.an.instanceof(Environment)
  })
  it('context', async () => {
    const odoo = await get_odoo()
    expect(odoo.env.context).to.include.keys('lang')
    expect(odoo.env.context).to.include.keys('tz')
    expect(odoo.env.context).to.include.keys('uid')
  })

  it('lang', async () => {
    const odoo = await get_odoo()
    expect(odoo.env.lang).to.be.equal(odoo.env.context.lang)
  })

  it('db', async () => {
    const odoo = await get_odoo()
    expect(odoo.env.db).to.be.equal(DB)
  })

  it('user', async () => {
    const odoo = await get_odoo()
    const user = await odoo.env.user
    expect(user.$login).to.be.equal(USER)
  })

  it('registry', async () => {
    const odoo = await get_odoo()
    const model_name = 'res.partner'
    // const Ptn =
    odoo.env.model(model_name)
    expect(odoo.env.registry).to.include.keys(model_name)
    delete odoo.env.registry[model_name]
    expect(odoo.env.registry).to.not.include.keys(model_name)
  })

  it('ref', async () => {
    const odoo = await get_odoo()
    const record = await odoo.env.ref('base.lang_en')
    // console.log('ref:', record)
    expect(record).to.be.an.instanceof(Model)
    expect(record._name).to.be.equal('res.lang')
    expect(record.$code).to.be.equal('en_US')
  })

  it('includes', async () => {
    const odoo = await get_odoo()
    const is_ok = await odoo.env.includes('res.partner')
    expect(is_ok).to.be.true
    const is_not = await odoo.env.includes('does.not.exist')
    expect(is_not).to.be.false
  })
})
