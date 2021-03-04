import { expect, assert } from 'chai'

import { get_odoo } from './config'

import { Environment } from '@/odoojs/env'
import { Model } from '@/odoojs/models'

describe('execute_kw', async () => {
  it('search with good args', async () => {
    const odoo = await get_odoo()
    const res = await odoo.execute_kw('res.users', 'search', [[]], {})
    expect(res).to.be.instanceOf(Array)
    expect(res).to.include(odoo.env.uid)

    const domain = [['id', '=', odoo.env.uid]]
    const res2 = await odoo.execute_kw('res.users', 'search', [domain], {
      order: 'name'
    })
    expect(res2).to.be.instanceOf(Array)
    expect(res2[0]).to.be.equal(odoo.env.uid)
  })

  it('search without args', async () => {
    const odoo = await get_odoo()
    const fn = async () => {
      await odoo.execute_kw('res.users', 'search')
    }
    return assert.isRejected(fn())
  })

  it('search with wrong args', async () => {
    const odoo = await get_odoo()
    const fn = async () => {
      await odoo.execute_kw('res.users', 'search', false)
    }
    return assert.isRejected(fn())
  })

  it('search with wrong model', async () => {
    const odoo = await get_odoo()
    const fn = async () => {
      await odoo.execute_kw('wrong.model', 'search', [[]], {})
    }
    return assert.isRejected(fn())
  })

  it('wrong method', async () => {
    const odoo = await get_odoo()
    const fn = async () => {
      await odoo.execute_kw('res.users', 'wrong_method', [])
    }
    return assert.isRejected(fn())
  })
})
