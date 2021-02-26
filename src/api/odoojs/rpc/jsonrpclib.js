import axios from 'axios'

class Proxy0 {
  constructor(payload) {
    const { baseURL, timeout = 50000 } = payload
    this._timeout = timeout
    this._baseURL = baseURL
    this._service = this._get_service()
  }

  _get_service() {
    const service = axios.create({
      baseURL: this._baseURL,
      timeout: this._timeout
    })

    service.interceptors.request.use(
      config => {
        // console.log('request config', config) // for debug
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
        // console.log('response ', response) // for debug
        const res = response.data
        // console.log('response data:', res) // for debug

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
