import { Environment } from './env'
import rpc from './rpc'

export class ODOO {
  constructor(payload) {
    const { baseURL, timeout = 50000 } = payload
    this._baseURL = baseURL
    this._env = undefined
    this._login = undefined
    this._password = undefined
    // this._db = DB(this)
    // this._report = Report(this)

    const protocol = 'jsonrpc'
    this._connector = new rpc.PROTOCOLS[protocol]({ baseURL, timeout })
  }

  get env() {
    this._check_logged_user()
    return this._env
  }

  get version() {
    // is promise
    return this._connector.version
  }

  async json_call(url, payload) {
    const data = await this._connector.proxy_json.call(url, payload)
    if (data.error) {
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
      //     raise error.InternalError("Login required")
    }
  }

  async login(payload) {
    const { db, login = 'admin', password = 'admin' } = payload || {}
    const data = await this.json_call('/web/session/authenticate', {
      db: db,
      login: login,
      password: password
    })

    const uid = data.result.uid

    if (uid) {
      const context = data.result.user_context
      this._env = new Environment(this, db, uid, { context })
      this._login = login
      this._password = password
      // TBD localstorage set
    } else {
      // raise error.RPCError("Wrong login ID or password")
    }
  }

  async logout() {
    if (!self._env) {
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
