import axios from 'axios'

class Proxy0 {
  constructor(payload) {
    const { baseURL, timeout = 500000 } = payload
    this._timeout = timeout
    this._baseURL = baseURL
  }
}

class ProxyJSON extends Proxy0 {
  constructor(payload) {
    const { baseURL, timeout, deserialize = true } = payload
    super({ baseURL, timeout })
    this._deserialize = deserialize
    this._respond = undefined
    this._sid = undefined
    this._service = this._get_service()
  }

  _get_service() {
    const service = axios.create({
      baseURL: this._baseURL,
      // withCredentials: true,
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
        // const headers = response.headers
        // console.log('headers ', headers) // for debug

        const url = response.config.url
        const url_auth = '/web/session/authenticate'
        const url_info = '/web/session/get_session_info'

        if (url === url_auth || url === url_info) {
          // if run test, not cookie,
          // so wo set sid to call odoo

          const headers = response.headers
          // console.log('headers ', headers) // for debug
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

class ProxyFileExport extends Proxy0 {
  constructor(payload) {
    const { baseURL, timeout, deserialize = true } = payload
    super({ baseURL, timeout })
    this._deserialize = deserialize
    this._service = this._get_service()
  }

  _get_service() {
    const service = axios.create({
      baseURL: this._baseURL,
      // withCredentials: true,
      timeout: this._timeout,
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: 'blob'
    })

    const that = this

    service.interceptors.request.use(
      config => {
        if (that._sid) {
          config.headers['X-Openerp-Session-Id'] = that._sid
        }

        const data = config.data
        const fd = new FormData()
        Object.keys(data).forEach(item => fd.append(item, data[item]))
        config.data = fd
        return config
      },

      error => {
        console.log('request error') // for debug
        // errorCallback(error)
        return Promise.reject(error)
      }
    )

    service.interceptors.response.use(
      response => {
        const resp_headers = response.headers
        const filename = resp_headers['content-disposition'].slice(29)
        const filetype = resp_headers['content-type']

        // console.log('rspd', response)
        // console.log('rspd resp_headers,', resp_headers)
        // // console.log('rspd filename,', filename)
        // // console.log('rspd filetype,', filetype)

        return { filetype, filename, data: response.data }
      },

      error => {
        console.log('respond error') // for debug
        // errorCallback(error)
        return Promise.reject(error)
      }
    )

    return service
  }

  async call(url, data) {
    const url2 = url[0] === '/' ? url : `/${url}`
    const token = 'dummy-because-api-expects-one'
    // const csrf_token = 'xxxxx'

    const response_data = await this._service({
      url: url2,
      method: 'post',
      data: {
        data: JSON.stringify(data),
        token
        // csrf_token
      }
    })

    // console.log(response_data)

    return response_data
  }
}

class ProxyFileImport extends Proxy0 {
  constructor(payload) {
    const { baseURL, timeout, deserialize = true } = payload
    super({ baseURL, timeout })
    this._deserialize = deserialize
    this._service = this._get_service()
  }

  _get_service() {
    const service = axios.create({
      baseURL: this._baseURL,
      // withCredentials: true,
      timeout: this._timeout,
      headers: {
        Accept:
          'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript, */*; q=0.01',
        'Content-Type': 'multipart/form-data'
      }
    })

    const that = this

    service.interceptors.request.use(
      config => {
        if (that._sid) {
          config.headers['X-Openerp-Session-Id'] = that._sid
        }

        const data = config.data
        const fd = new FormData()
        Object.keys(data).forEach(item => fd.append(item, data[item]))
        config.data = fd
        return config
      },

      error => {
        console.log('request error') // for debug
        // errorCallback(error)
        return Promise.reject(error)
      }
    )

    service.interceptors.response.use(
      response => {
        // console.log('rspd', response)
        // console.log('rspd', response.data)
        return response.data
      },

      error => {
        console.log('respond error') // for debug
        // errorCallback(error)
        return Promise.reject(error)
      }
    )

    return service
  }

  async call(url, payload) {
    const url2 = url[0] === '/' ? url : `/${url}`
    // const csrf_token = 'xxxxx'

    const { import_id, file, jsonp } = payload
    const payload2 = {
      import_id,
      file
      // csrf_token
    }
    if (jsonp) {
      payload2.payload2 = jsonp
    }

    const response_data = await this._service({
      url: url2,
      method: 'post',
      data: payload2
    })

    // console.log(response_data)

    return response_data
  }
}

export default { ProxyJSON, ProxyFileExport, ProxyFileImport }
