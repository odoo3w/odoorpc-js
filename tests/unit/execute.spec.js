import { expect, assert } from 'chai'

import { db, login, get_odoo } from './config'

import { Environment } from '@/odoojs/env'
import { Model } from '@/odoojs/models'

describe('execute', async () => {
  it('search with good args', async () => {
    const odoo = await get_odoo()
    const res = await odoo.execute('res.users', 'search', [])
    expect(res).to.be.instanceOf(Array)
    expect(res).to.include(odoo.env.uid)

    const domain = [['id', '=', odoo.env.uid]]
    const res2 = await odoo.execute('res.users', 'search', domain)
    expect(res2).to.be.instanceOf(Array)
    expect(res2[0]).to.be.equal(odoo.env.uid)
  })

  it('search without args', async () => {
    const odoo = await get_odoo()
    const fn = async () => {
      await odoo.execute('res.users', 'search')
    }
    return assert.isRejected(fn(), Error)
  })

  it('search with wrong args', async () => {
    const odoo = await get_odoo()
    const fn = async () => {
      await odoo.execute('res.users', 'search', false)
    }
    return assert.isRejected(fn(), Error)
  })

  it('search with wrong model', async () => {
    const odoo = await get_odoo()
    const fn = async () => {
      await odoo.execute('wrong.model', 'search', [])
    }
    return assert.isRejected(fn(), Error)
  })

  it('wrong method', async () => {
    const odoo = await get_odoo()
    const fn = async () => {
      await odoo.execute('res.users', 'wrong_method', [])
    }
    return assert.isRejected(fn(), Error)
  })
})
