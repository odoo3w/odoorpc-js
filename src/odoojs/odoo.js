import { Environment } from './env.js'
import rpc from './rpc/index.js'

export class ODOO {
  constructor(payload) {
    const { baseURL, timeout = 50000, addons = {} } = payload
    this._baseURL = baseURL

    this._addons = addons

    this._env = undefined

    this._login = undefined

    // this._db = DB(this)
    // this._report = Report(this)
    this._version = undefined
    this._awaiters = []

    const protocol = 'jsonrpc'
    this._connector = new rpc.PROTOCOLS[protocol]({ baseURL, timeout })

    const version = new Promise(resolve => {
      this._connector.version.then(version => {
        this._version = version
        resolve(true)
      })
    })

    this._awaiters.push(version)

    // odoorpc2 append
    this._session_info = {}
    this._virtual_id = 1
    this._input_id = 1
    this._input_value_id = 1

    this._config = {
      //
    }

    this._allowed_company_ids = []

    this.debug_count = 0
  }

  get config() {
    return this._config
  }

  get baseURL() {
    return this._baseURL
  }

  get env() {
    this._check_logged_user()
    return this._env
  }

  // async init() {
  //   // new ODOO() maybe call server to get server version
  //   // this async method to wait return

  //   // this._connector.version is promise
  //   this._version = await this._connector.version
  // }

  get awaiter() {
    const _wait_awaiter = async () => {
      // this._awaiters is promise list, wait for 1:version finished
      while (this._awaiters.length) {
        const one = this._awaiters.shift()
        await one
      }
    }
    return _wait_awaiter()
  }

  get version() {
    return this._version
  }

  get session_info() {
    return this._session_info
  }

  get current_company_id() {
    return this._session_info.user_companies.current_company[0]
  }

  get allowed_company_ids() {
    return this._allowed_company_ids

    // const cids_str = this.get_cookie('cids')
    // const cids = cids_str
    //   ? cids_str.split(',').map(item => Number(item))
    //   : this._session_info.user_companies.allowed_companies.map(item => item[0])
    // return cids
  }

  get_allowed_company_ids() {
    const cids_str = this.get_cookie('cids')
    const cids = cids_str
      ? cids_str.split(',').map(item => Number(item))
      : this._session_info.user_companies.allowed_companies.map(item => item[0])
    return cids
  }

  set allowed_company_ids(cids = []) {
    this.set_allowed_company_ids(cids)
    this._allowed_company_ids = cids
  }

  set_allowed_company_ids(cids = []) {
    const cids_str = cids.join(',')
    this.set_cookie('cids', cids_str || String(this.current_company_id))
  }

  _get_virtual_id() {
    // new a o2m field, need an unique virtual id
    const int_virtual_id = this._virtual_id
    this._virtual_id = this._virtual_id + 1
    return `virtual_${int_virtual_id}`
  }

  _get_input_id() {
    // new a o2m field, need an unique virtual id
    const int_input_id = this._input_id
    this._input_id = this._input_id + 1
    return `o_field_input_${int_input_id}`
  }

  async json_call(url, payload) {
    // JSON a keyword in js. so rename json_call
    const data = await this._connector.proxy_json.call(url, payload)
    if (data.error) {
      // TBD
      throw data.error
      // raise error.RPCError(
      //   data['error']['data']['message'],
      //   data['error'])
    } else {
      return data
    }
  }

  async file_export(url, payload) {
    const data = await this._connector.proxy_file_export.call(url, payload)
    if (data.error) {
      // TBD
      throw data.error
      // raise error.RPCError(
      //   data['error']['data']['message'],
      //   data['error'])
    } else {
      return data
    }
  }

  async file_import(url, payload) {
    const data = await this._connector.proxy_file_import.call(url, payload)
    if (data.error) {
      // TBD
      throw data.error
      // raise error.RPCError(
      //   data['error']['data']['message'],
      //   data['error'])
    } else {
      return data
    }
  }

  // 数据导出 流程
  // 1. call: /web/export/formats,
  //    return: [{tag: "csv", label: "CSV"}, {tag: "xlsx", label: "XLSX", error: null}]
  // 2. call /web/export/get_fields,
  //    param: model, import_compat
  //    return: [{id, value, string, field_type }]
  // 3. call /web/dataset/call_kw/ir.exports/search_read
  // 4. call export_xlsx()
  //    param:

  async export_xlsx(data) {
    // param:
    // const data = {
    //   model: 'sale.order',
    //   fields: [
    //     { name: 'name', label: '订单关联' },
    //     { name: 'create_date', label: '创建日期' },
    //     { name: 'commitment_date', label: '交货日期' },
    //     { name: 'expected_date', label: '预计日期' },
    //     { name: 'partner_id', label: '客户' },
    //     { name: 'user_id', label: '销售员' },
    //     { name: 'amount_total', label: '合计' },
    //     { name: 'state', label: '状态' },
    //     { name: 'activity_exception_decoration', label: '活动例外勋章' }
    //   ],
    //   ids: [13],
    //   domain: [['user_id', '=', 2]],
    //   groupby: [],
    //   context: {
    //     lang: 'zh_CN',
    //     tz: false,
    //     uid: 2,
    //     allowed_company_ids: [1],
    //     params: {
    //       action: 318,
    //       cids: 1,
    //       menu_id: 189,
    //       model: 'sale.order',
    //       view_type: 'list'
    //     }
    //   },
    //   import_compat: false
    // }

    this._check_logged_user()
    const url = '/web2/export/xlsx'
    const data2 = await this.file_export(url, data)

    return data2
  }

  async export_csv(data) {
    this._check_logged_user()
    const url = '/web2/export/csv'
    const data2 = await this.file_export(url, data)

    return data2
  }

  download({ filename, filetype, data }) {
    // //ArrayBuffer 转为 Blob
    const blob = new Blob([data], { type: filetype })
    const objectUrl = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.setAttribute('href', objectUrl)
    a.setAttribute('download', filename)
    a.click()
  }

  upload(callback) {
    const input = document.createElement('input')
    input.type = 'file'
    input.click()
    input.onchange = () => {
      const file = input.files[0]
      callback(file)
    }
  }

  check_logged_user() {
    try {
      this._check_logged_user()
      return true
    } catch (erorr) {
      return false
    }
  }
  _check_logged_user() {
    // """Check if a user is logged. Otherwise, an error is raised."""
    // TBD localstorage get
    // console.log(' _check_logged_user,')
    if (!this._env || !this._login) {
      throw 'Login required'
      //     raise error.InternalError("Login required")
    }
  }

  get_cookie(c_name) {
    var cookies = document.cookie ? document.cookie.split('; ') : []
    // console.log('document.cookie ', document.cookie)
    // console.log('cookies ', cookies)
    for (var i = 0, l = cookies.length; i < l; i++) {
      var parts = cookies[i].split('=')
      var name = parts.shift()
      var cookie = parts.join('=')

      if (c_name && c_name === name) {
        return cookie
      }
    }
    return ''
  }

  // set cids,
  // odoo.set_cookie('cids', hash.cids || String(main_company_id));

  set_cookie(name, value, ttl) {
    ttl = ttl || 24 * 60 * 60 * 365
    document.cookie = [
      name + '=' + value,
      'path=/',
      'max-age=' + ttl,
      'expires=' + new Date(new Date().getTime() + ttl * 1000).toGMTString()
    ].join(';')
  }

  async get_session_info() {
    await this.awaiter

    try {
      const data = await this.json_call('/web/session/get_session_info', {})
      // console.log(' get_session_info ok ')
      // console.log(' get_session_info ok ', data.result)

      return data
    } catch (error) {
      console.log(' get_session_info error ')
      // console.log(' get_session_info error ', error)
      return null
    }
  }

  async authenticate(payload) {
    await this.awaiter
    const { db, login = 'admin', password = 'admin' } = payload || {}

    try {
      const data = await this.json_call('/web/session/authenticate', {
        db: db,
        login: login,
        password: password
      })
      // console.log(' authenticate ok ')
      // console.log(' authenticate ok ', data.result)

      return data
    } catch (error) {
      console.log(' authenticate error ')
      // console.log(' authenticate error ', error)
      return null
    }
  }

  init_odoo(result) {
    //
    this._session_info = { ...result }
    const db = result.db
    const login = result.username
    const uid = result.uid
    const context = result.user_context
    this._env = new Environment(this, db, uid, {
      context,
      addons: this._addons
    })

    this._login = login
    this._allowed_company_ids = this.get_allowed_company_ids()
  }

  async login(payload) {
    // console.log('login')
    await this.awaiter

    const data = await this.authenticate(payload)
    // console.log('login: ', data.result)
    const result = data.result

    this.init_odoo(result)
    await this.env._set_model_registry()

    console.log('login ok')
    // read cids , to set allowed company_ids
    // const cids = this.get_cookie('cids')
    // console.log('cids', cids)

    const uid = data.result.uid
    return uid
  }

  async session_check() {
    console.log('session_check')
    try {
      const is_ok = this.check_logged_user()
      console.log('session_check,check_logged_user', is_ok)
      if (is_ok) {
        await this._session_check()
      } else {
        const data = await this.get_session_info()
        // console.log('get_session_info:', data.result)
        this.init_odoo(data.result)
        await this.env._set_model_registry()
      }
      return true
    } catch (erorr) {
      this._env = null
      this._login = null

      return false
    }
  }

  async _session_check() {
    await this.json_call('/web/session/check', {})
  }

  async logout() {
    console.log('logout, 1', this._env)
    if (!this._env) {
      return false
    }
    console.log('logout, 2')

    await this.json_call('/web/session/destroy', {})
    this._env = null
    this._login = null

    return true
  }

  async execute(model, method, ...args) {
    return this.execute_kw(model, method, args, {})
  }

  async execute_kw(model, method, args = [], kwargs = {}) {
    this._check_logged_user()
    const url2 = '/web/dataset/call_kw'
    const url = `${url2}/${model}/${method}`
    const payload = { model, method, args, kwargs }
    const data = await this.json_call(url, payload)
    return data.result
  }
  async action_load(action_id, additional_context = {}) {
    this._check_logged_user()
    const url = '/web/action/load'
    const payload = { action_id, additional_context }
    const data = await this.json_call(url, payload)
    return data.result
  }
}
