import { expect } from 'chai'

import { BASE_URL } from './config'

import { ODOO } from '@/odoojs'

describe('odoorpc init', () => {
  it('new', async () => {
    const odoo = new ODOO({ baseURL: BASE_URL })
    expect(odoo).to.be.an.instanceof(ODOO)
    expect(odoo).to.be.ok
    expect(odoo.baseURL).to.equal(BASE_URL)
  })
  it('version by delay', async () => {
    const odoo = new ODOO({ baseURL: BASE_URL })
    expect(odoo.version).to.be.undefined
    const delay = new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, 1000)
    })
    await delay
    expect(odoo.version.slice(0, 4)).to.equal('13.0')
  })

  it('version by init', async () => {
    const odoo = new ODOO({ baseURL: BASE_URL })
    expect(odoo.version).to.be.undefined
    await odoo.awaiter
    expect(odoo.version.slice(0, 4)).to.equal('13.0')
  })
})
