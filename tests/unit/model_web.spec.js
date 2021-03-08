import { expect, assert } from 'chai'

import { get_odoo } from './config.js'

import { Environment } from '@/odoojs/env.js'
import { Model } from '@/odoojs/models.js'

describe('model web', async () => {
  it('search browse and next', async () => {
    const odoo = await get_odoo()
    const SO = odoo.env.model('ir.model.fields')

    const domain = [
      ['model', 'like', 'sale'],
      ['name', 'in', ['name', 'display_name']]
    ]

    let sos = await SO.pageSearch(domain, { order: 'id' })
    console.log('next:', sos.totalIds, sos.count, sos.pageCount)

    let flag = true

    do {
      const so = await sos.pageNext()
      console.log(so.currentPage, so.ids)
      flag = so.isNotNull
    } while (flag)

    sos = await SO.pageSearch(domain, { order: 'id' })
    console.log('prev:', sos.totalIds, sos.count, sos.pageCount)

    flag = true

    do {
      const so = await sos.pagePrev()
      console.log(so.currentPage, so.ids)

      flag = so.isNotNull
    } while (flag)

    const goto = async page => {
      const so = await sos.pageGoto(page)
      console.log(so.currentPage, so.ids)
    }

    goto(1)
    goto(4)
    goto(3)
    goto(2)

    const so = await sos.pageGoto(0)
    const data = so && so.toArray()
    console.log(data)

    const rec = so && so.toObject()
    console.log(rec)
  })

  it('view', async () => {
    const odoo = await get_odoo()
    const SO = odoo.env.model('res.partner')
    const ids = await SO.search([])
    const so = await SO.browse(ids)
    console.log('next:', so)

    const rec = so.toObject()
    console.log(rec)
  })

  it('form', async () => {
    const odoo = await get_odoo()
    const SO = odoo.env.model('res.partner')
    const ids = await SO.search([])
    const so = await SO.browse(ids)
    console.log('next:', so)

    const rec = so.toObject()
    console.log(rec)
  })
})
