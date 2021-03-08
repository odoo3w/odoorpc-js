import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)

import axios from 'axios'
import adapter from 'axios/lib/adapters/http'
axios.defaults.adapter = adapter
// axios.defaults.adapter = require('axios/lib/adapters/http')

global.DOMParser = window.DOMParser

import { ODOO } from '@/odoojs'

export const BASE_URL = 'http://192.168.56.103:8069'
export const DB = 'T2'
// export const DB = 'erpapp'
export const USER = 'admin'
export const PSW = '123456'

let odoo_this = undefined

export const get_odoo = async () => {
  if (!odoo_this) {
    const odoo = new ODOO({ baseURL: BASE_URL })
    await odoo.login({ db: DB, login: USER, password: PSW })
    odoo_this = odoo
  }
  return odoo_this
}
