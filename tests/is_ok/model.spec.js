import { expect, assert } from 'chai'

import { get_odoo } from './config'

import { Environment } from '@/odoojs/env'
import { Model } from '@/odoojs/models'

describe('model', async () => {
  it('create model class', async () => {
    const odoo = await get_odoo()
    const Partner = odoo.env.model('res.partner')
    expect(Partner._name).to.be.equal('res.partner')
    await Partner.awaiter
    expect(Partner._columns).to.include.keys('name')
  })
  it('model browse', async () => {
    const odoo = await get_odoo()
    const Partner = odoo.env.model('res.partner')
    const partner = await Partner.browse(1)
    expect(partner).to.be.an.instanceOf(Model)
    expect(partner.id).to.be.equal(1)
    expect(partner.ids).to.eql([1])
    expect(partner.env).to.eql(Partner.env)
    const partners = await Partner.browse([1])
    expect(partners).to.be.an.instanceOf(Model)
    expect(partners.id).to.be.equal(1)
    expect(partners.ids).to.eql([1])
    expect(partners.env).to.eql(Partner.env)
  })
  it('model browse false', async () => {
    const odoo = await get_odoo()
    const Partner = odoo.env.model('res.partner')
    const partner = await Partner.browse(false)
    expect(partner.length).to.be.equal(0)
  })
  it('model browse wrong id', async () => {
    const odoo = await get_odoo()
    const Partner = odoo.env.model('res.partner')
    const fn = async () => {
      return await Partner.browse(9999999)
    }
    return assert.isRejected(fn())
  })
  it('model browse without id', async () => {
    const odoo = await get_odoo()
    const Partner = odoo.env.model('res.partner')
    const fn = async () => {
      return await Partner.browse()
    }
    return assert.isRejected(fn())
  })
  it('model rpc method', async () => {
    const odoo = await get_odoo()
    const Partner = odoo.env.model('res.users')
    const me = await Partner.execute('name_get', odoo.env.uid)
    // console.log(me)
    const res = await odoo.env
      .model('ir.sequence')
      .execute('next_by_code', 'fake.code')
    // console.log(res)
  })
  it('model rpc method error no args', async () => {
    const odoo = await get_odoo()
    const Partner = odoo.env.model('res.partner')
    // Partner.search(false)
    const fn = async () => {
      return await Partner.execute('name_get')
    }
    return assert.isRejected(fn())
  })
  it('model rpc method error wrong args', async () => {
    const odoo = await get_odoo()
    const Partner = odoo.env.model('res.partner')
    // Partner.search(false)
    const fn = async () => {
      return await Partner.execute('search', false)
    }
    return assert.isRejected(fn())
  })
})

describe('model', async () => {
  it('with_context', async () => {
    const odoo = await get_odoo()
    const Product = odoo.env.model('product.product')
    const product_id = await Product.create({
      name: 'Product invisible',
      active: false
    })
    const product_ids = await Product.search([])
    expect(product_ids).to.not.include(product_id)
    const product_ids2 = await Product.with_context({
      active_test: false
    }).search([])
    expect(product_ids2).to.include(product_id)
    const product_ids3 = await Product.search([])
    expect(product_ids3).to.not.include(product_id)
  })
  it('model slice', async () => {
    const odoo = await get_odoo()
    const Partner = odoo.env.model('res.partner')
    const partner = await Partner.browse(1)
    const p2 = partner.slice(0, 1)
    // how to do deep equal
    expect(p2.ids).to.eql(partner.ids)
    // expect(p2).to.eql(partner)
  })
  it('model iter', async () => {
    const odoo = await get_odoo()
    const Partner = odoo.env.model('res.partner')
    const ids = await Partner.search([])
    const partners = await Partner.browse(ids)
    const ids2 = []
    for (const p of partners) {
      ids2.push(p.id)
    }
    // console.log(ids2)
    // console.log(partners.ids)
    expect(ids2).to.eql(partners.ids)
  })
})

describe('model', async () => {
  it('record_with_context read', async () => {
    const odoo = await get_odoo()
    const user = await odoo.env.user
    expect(user.env.lang).to.be.equal('zh_CN')
    const user_en = await user.with_context({ lang: 'en_US' })
    expect(user_en.env.lang).to.be.equal('en_US')
    // // # Install 'en_US' and test the use of context with it
    // const Wizard = odoo.env.model('base.language.install')
    // const wiz_id = await Wizard.create({ lang: 'en_US' })
    // await Wizard.execute('lang_install', [wiz_id])
    // # Read data with two languages
    const Country = odoo.env.model('res.country')
    const cn_ids = await Country.search([['code', '=', 'CN']])
    const cn_id = cn_ids[0]
    const cn = await Country.browse(cn_id)
    // console.log(cn.$name)
    expect(cn.$name).to.be.equal('中国')
    const cn2 = await cn.with_context({ lang: 'en_US' })
    // console.log(cn2.$name)
    expect(cn2.$name).to.be.equal('China')
  })
  it('record_with_context write', async () => {
    // # Write data with two languages
    const odoo = await get_odoo()
    const Product = odoo.env.model('product.product')
    expect(Product.env.lang).to.be.equal('zh_CN')
    const name_cn = 'Product zh_CN'
    const product_id = await Product.create({ name: name_cn })
    const product_cn = await Product.browse(product_id)
    expect(product_cn.$name).to.be.equal(name_cn)
    const product_en = await product_cn.with_context({ lang: 'en_US' })
    expect(product_en.env.lang).to.be.equal('en_US')
    const name_en = 'Product en_US'
    await product_en.write({ name: name_en })
    const product_en2 = await product_en.with_context()
    expect(product_en2.$name).to.be.equal(name_en)
    expect(product_en2.env.lang).to.be.equal('en_US')
    expect(Product.env.lang).to.be.equal('zh_CN')
    const product_cn2 = await Product.browse(product_id)
    expect(product_cn2.$name).to.be.equal(name_cn)
  })
})
