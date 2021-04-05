import { baseURL } from './api_config'
import { ODOO as OdooBase } from '@/odoojs'

const AddonsFiles = require.context('./addons', true, /\.js$/)

// you do not need `import sale from './addons/sale'`
// it will auto require all odoo model from addons file
const AddonsModels = AddonsFiles.keys().reduce((models, modulePath) => {
  // const moduleName = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
  const value = AddonsFiles(modulePath)
  models = { ...models, ...value.default }
  return models
}, {})

const addons = { ...AddonsModels }

// import Event from './addons/event.js'
// import Ptn from './addons/res.partner.js'

// const addons = { ...Event, ...Ptn }

// // console.log('xxxx,', AddonsModels)

export const ODOO = OdooBase

const odoo = new ODOO({ baseURL, addons })

export default odoo
