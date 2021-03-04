import { Environment } from './env.js'
import rpc from './rpc/index.js'

export class ODOO {
  constructor(payload) {
    const { baseURL, timeout = 50000 } = payload
    this._baseURL = baseURL
    this._env = undefined
    this._login = undefined
    this._password = undefined
    // this._db = DB(this)
    // this._report = Report(this)
    this._version = undefined
    const protocol = 'jsonrpc'
    this._connector = new rpc.PROTOCOLS[protocol]({ baseURL, timeout })

    this._connector.version.then(version => {
      this._version = version
    })

    // odoorpc2 append
    this._session_info = {}
    this._virtual_id = 1
  }

  get baseURL() {
    return this._baseURL
  }

  get env() {
    this._check_logged_user()
    return this._env
  }

  async init() {
    // new ODOO() maybe call server to get server version
    // this async method to wait return

    // this._connector.version is promise
    this._version = await this._connector.version
  }

  get version() {
    return this._version
  }

  get session_info() {
    return this._session_info
  }

  _get_virtual_id() {
    // new a o2m field, need an unique virtual id
    const int_virtual_id = this._virtual_id
    this._virtual_id = this._virtual_id + 1
    return `virtual_${int_virtual_id}`
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

  _check_logged_user() {
    // """Check if a user is logged. Otherwise, an error is raised."""
    // TBD localstorage get
    if (!this._env || !this._password || !this._login) {
      throw 'Login required'
      //     raise error.InternalError("Login required")
    }
  }

  async login(payload) {
    await this.init()
    const { db, login = 'admin', password = 'admin' } = payload || {}
    const data = await this.json_call('/web/session/authenticate', {
      db: db,
      login: login,
      password: password
    })

    const uid = data.result.uid

    if (uid) {
      this._session_info = data.result
      const context = data.result.user_context
      this._env = new Environment(this, db, uid, { context })
      this._login = login
      this._password = password
      // TBD localstorage set
    } else {
      throw 'Wrong login ID or password'
      // raise error.RPCError("Wrong login ID or password")
    }
  }

  async logout() {
    if (!this._env) {
      return false
    }

    await this.json_call('/web/session/destroy', {})
    this._env = null
    this._login = null
    this._password = null
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
}
