import { expect } from 'chai'

import { baseURL } from './config'

import { ODOO } from '@/odoojs'

describe('odoorpc init', () => {
  it('new', async () => {
    const odoo = new ODOO({ baseURL })
    expect(odoo).to.be.an.instanceof(ODOO)
    expect(odoo).to.be.ok
    expect(odoo.baseURL).to.equal(baseURL)
  })
  it('version by delay', async () => {
    const odoo = new ODOO({ baseURL })
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
    const odoo = new ODOO({ baseURL })
    expect(odoo.version).to.be.undefined
    await odoo.init()
    expect(odoo.version.slice(0, 4)).to.equal('13.0')
  })
})

// describe('ODOO login', () => {
//   it('login', async () => {
//     const odoo = new ODOO({ baseURL })
//     expect(odoo.env).to.be.undefined
//     await odoo.login({
//       db: 'T2',
//       login: 'admin',
//       password: '123456'
//     })

//     expect(odoo.version.slice(0, 4)).to.equal('13.0')
//     expect(odoo.env).to.be.an.instanceof(Environment)
//     expect(odoo.env.uid).to.equal(2)
//   })
// })

// describe('My Test2', () => {
//   it('is run', async () => {
//     const foo = new Promise(resolve => {
//       resolve('bar21')
//     })
//     const foo2 = await foo
//     expect(foo2).to.equal('bar2')
//     //   const foo2 = 'bar2'
//     //   expect(foo2).to.not.equal('bar')
//     // expect(wrapper.text()).to.include(msg)
//   })
// })
