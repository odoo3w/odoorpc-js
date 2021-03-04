import { expect, assert } from 'chai'

import { get_odoo } from './config'

import { Environment } from '@/odoojs/env'
import { Model } from '@/odoojs/models'

describe('field read', async () => {
  it('many2one', async () => {
    const odoo = await get_odoo()
    const User = odoo.env.model('res.users')
    const user = await User.browse(1)
    const company = await user.$company_id
    // console.log(company)
    expect(company).to.be.an.instanceof(Model)
    expect(company.id).to.be.equal(1)
    expect(company.ids).to.be.eql([1])
    expect(company.env.db).to.be.eql(user.env.db)
    expect(company.env.uid).to.be.eql(user.env.uid)
    const title = await user.$title
    expect(title).to.be.an.instanceof(Model)
    expect(title.isNotNull).to.be.false
  })

  it('many2many', async () => {
    const odoo = await get_odoo()
    const user = await odoo.env.user
    const companys = await user.$company_ids
    // console.log(company)
    expect(companys).to.be.an.instanceof(Model)
    expect(companys._name).to.be.equal('res.company')
    const category_id = await user.$category_id
    expect(category_id).to.be.an.instanceof(Model)
    expect(category_id.ids.length).to.be.eql(0)
    expect(category_id.isNotNull).to.be.false
  })

  it('one2many', async () => {
    const odoo = await get_odoo()
    const user = await odoo.env.user
    const child_ids = await user.$child_ids
    expect(child_ids).to.be.an.instanceof(Model)
    expect(child_ids.ids.length).to.be.eql(0)
    expect(child_ids.isNotNull).to.be.false

    const message_follower_ids = await user.$message_follower_ids
    expect(message_follower_ids).to.be.an.instanceof(Model)
    expect(message_follower_ids.ids.length).to.be.eql(0)
    expect(message_follower_ids.isNotNull).to.be.false
  })
})

describe('field read', async () => {
  it('Reference', async () => {
    const odoo = await get_odoo()
    const Menu = odoo.env.model('ir.ui.menu')
    const menu_ids = await Menu.search([['action', '>', 'ir.']])
    // console.log(menu_ids)
    const menu = await Menu.browse(menu_ids[0])
    const action = await menu.$action

    expect(action).to.be.an.instanceof(Model)
    expect(action._name).to.be.eql('ir.actions.act_window')
    expect(action.id).to.be.eql(74)
  })
})

describe('model', async () => {})
