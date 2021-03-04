import { expect, assert } from 'chai'

import { BASE_URL, DB, USER, PSW } from './config'

import { ODOO } from '@/odoojs'
import { Environment } from '@/odoojs/env'
import { Model } from '@/odoojs/models'

describe('login', () => {
  it('get env before login ', async () => {
    const odoo = new ODOO({ baseURL: BASE_URL })
    const fn = async () => {
      odoo.env
    }
    return assert.isRejected(fn())
  })

  it('login', async () => {
    const odoo = new ODOO({ baseURL: BASE_URL })
    await odoo.login({ db: DB, login: USER, password: PSW })

    expect(odoo.version.slice(0, 4)).to.equal('13.0')
    expect(odoo.env).to.be.ok
    expect(odoo.env).to.be.an.instanceof(Environment)
    const user = await odoo.env.user
    expect(user).to.be.an.instanceof(Model)
    expect(odoo.env.registry).to.include.keys('res.users')
    expect(odoo.env.db).to.equal(DB)
  })

  it('login no password', async () => {
    const odoo = new ODOO({ baseURL: BASE_URL })
    const fn = async () => {
      await odoo.login({ db: DB, login: USER, password: undefined })
    }
    return assert.isRejected(fn())
  })

  it('logout', async () => {
    const odoo = new ODOO({ baseURL: BASE_URL })
    await odoo.login({ db: DB, login: USER, password: PSW })
    const success = await odoo.logout()
    expect(success).to.be.true
  })
  it('logout without login', async () => {
    const odoo = new ODOO({ baseURL: BASE_URL })
    const success = await odoo.logout()
    expect(success).to.be.false
  })
})

describe('odoorpc2 login', () => {
  it('session after login ', async () => {
    const odoo = new ODOO({ baseURL: BASE_URL })
    expect(odoo.session_info).to.not.include.keys('uid')
    await odoo.login({ db: DB, login: USER, password: PSW })
    expect(odoo.session_info).to.include.keys('uid')
  })
})
