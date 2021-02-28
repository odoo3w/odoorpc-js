import { expect, assert } from 'chai'

import { baseURL, db, login, password } from './config'

import { ODOO } from '@/odoojs'
import { Environment } from '@/odoojs/env'
import { Model } from '@/odoojs/models'

describe('login', () => {
  it('get env before login ', async () => {
    const odoo = new ODOO({ baseURL })
    const fn = async () => {
      odoo.env
    }
    return assert.isRejected(fn())
  })

  it('login', async () => {
    const odoo = new ODOO({ baseURL })
    await odoo.login({ db, login, password })

    expect(odoo.version.slice(0, 4)).to.equal('13.0')
    expect(odoo.env).to.be.ok
    expect(odoo.env).to.be.an.instanceof(Environment)
    const user = await odoo.env.user
    expect(user).to.be.an.instanceof(Model)
    expect(odoo.env.registry).to.include.keys('res.users')
    expect(odoo.env.db).to.equal(db)
  })

  it('login no password', async () => {
    const odoo = new ODOO({ baseURL })
    const fn = async () => {
      await odoo.login({ db, login: 'admin', password: undefined })
    }
    return assert.isRejected(fn())
  })

  it('logout', async () => {
    const odoo = new ODOO({ baseURL })
    await odoo.login({ db, login, password })
    const success = await odoo.logout()
    expect(success).to.be.true
  })
  it('logout without login', async () => {
    const odoo = new ODOO({ baseURL })
    const success = await odoo.logout()
    expect(success).to.be.false
  })
})
