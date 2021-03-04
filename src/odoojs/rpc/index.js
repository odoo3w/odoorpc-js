import jsonrpclib from './jsonrpclib.js'

class Connector {
  constructor(payload) {
    const { baseURL, timeout } = payload

    this.baseURL = baseURL
    this._timeout = timeout
    this.version = undefined
  }
}

class ConnectorJSONRPC extends Connector {
  constructor(payload) {
    const { baseURL, timeout, deserialize = true } = payload
    super({ baseURL, timeout })
    this.deserialize = deserialize
    const [_proxy_json, _proxy_http] = this._get_proxies()
    this._proxy_json = _proxy_json
    this._proxy_http = _proxy_http
    //
  }

  _get_proxies() {
    const proxy_json = new jsonrpclib.ProxyJSON({
      baseURL: this.baseURL,
      timeout: this._timeout,
      deserialize: this.deserialize
    })

    if (!this.version) {
      // console.log('_get_proxies, version')
      const version_info = proxy_json.call('/web/webclient/version_info')

      // const that = this

      this.version = new Promise((resolve, reject) => {
        version_info.then(vinfo => {
          // console.log('_get_proxies, version', vinfo)
          const result = vinfo.result
          if (result.server_version) {
            resolve(result.server_version)
            // that.version = result.server_version
          } else {
            reject(false)
          }
        })
      })
    }

    return [proxy_json, undefined]
  }

  get proxy_json() {
    return this._proxy_json
  }
}

class ConnectorJSONRPCSSL extends Connector {
  //
}

const PROTOCOLS = {
  jsonrpc: ConnectorJSONRPC,
  'jsonrpc+ssl': ConnectorJSONRPCSSL
}

export default {
  PROTOCOLS
}
