import { ODOO as OdooBase } from '@/odoojs'

export const ODOO = OdooBase

// export default { ODOO }

const baseURL = process.env.VUE_APP_BASE_API
console.log('init odoo', baseURL)

const odoo = new ODOO({ baseURL })
console.log('init odoo ok')

// console.log(odoo)
// odoo.login

export default odoo
