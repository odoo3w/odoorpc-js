import axios from 'axios'

class Proxy0 {
  constructor(payload) {
    const { baseURL, timeout = 50000 } = payload
    this._timeout = timeout
    this._baseURL = baseURL
    this._service = this._get_service()
    this._respond = undefined
    this._sid = undefined
  }

  _get_service() {
    const service = axios.create({
      baseURL: this._baseURL,
      timeout: this._timeout
    })

    const that = this

    service.interceptors.request.use(
      config => {
        // console.log('sid', that._sid)
        // console.log('request config', config) // for debug
        // if run test, not cookie,
        // so wo set sid to call odoo

        if (that._sid) {
          // console.log('sid req: ', that._sid)
          config.headers['X-Openerp-Session-Id'] = that._sid
        }

        return config
      },
      error => {
        console.log('request error', error) // for debug
        // errorCallback(error)
        return Promise.reject(error)
      }
    )

    service.interceptors.response.use(
      response => {
        const url = response.config.url
        if (url === '/web/session/authenticate') {
          // if run test, not cookie,
          // so wo set sid to call odoo

          const headers = response.headers
          const cookie = headers['set-cookie']
          // console.log('cookie ', cookie) // for debug
          if (cookie) {
            // console.log('cookie ok', cookie) // for debug
            const cookie2 = cookie[0]
            const session_id = cookie2.slice(11, 51)
            that._sid = session_id
          }
        }

        const res = response.data
        // console.log('response data:', res) // for debug
        that._respond = response
        return res
      },
      error => {
        console.log('respond error', error) // for debug
        // errorCallback(error)
        return Promise.reject(error)
      }
    )

    return service
  }
}

class ProxyJSON extends Proxy0 {
  constructor(payload) {
    const { baseURL, timeout, deserialize = true } = payload
    super({ baseURL, timeout })
    this._deserialize = deserialize
  }
  async call(url, params = {}) {
    // console.log('ProxyJSON call', url, params)
    const data = {
      jsonrpc: '2.0',
      method: 'call',
      params: params,
      id: Math.floor(Math.random() * 1000000000 + 1)
    }

    const url2 = url[0] === '/' ? url : `/${url}`

    const response_data = await this._service({
      url: url2,
      method: 'post',
      data
    })

    // console.log('ProxyJSON, call', response_data)

    if (!this._deserialize) {
      return response_data
    }
    return response_data
  }
}

export default { ProxyJSON }
