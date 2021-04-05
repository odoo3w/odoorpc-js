class ProxyJSON {
  constructor(payload) {
    const { baseURL, timeout = 500000 } = payload
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

    // .....
    // 这里 补充  axios 的封装
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

    return response_data
  }
}

export default { ProxyJSON }
