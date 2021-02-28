import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)

import axios from 'axios'
axios.defaults.adapter = require('axios/lib/adapters/http')

import { ODOO } from '@/odoojs'

export const baseURL = 'http://192.168.56.103:8069'
export const db = 'T2'
export const login = 'admin'
export const password = '123456'

let odoo_this = undefined

export const get_odoo = async () => {
  if (!odoo_this) {
    const odoo = new ODOO({ baseURL })
    await odoo.login({ db, login, password })
    odoo_this = odoo
  }
  return odoo_this
}
