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

    this._proxy_json = this._get_proxy_json()
    this._proxy_http = undefined
    this._proxy_file_export = this._get_proxy_file_export()
    this._proxy_file_import = this._get_proxy_file_import()
  }

  _get_proxy_file_import() {
    return this._get_proxy(jsonrpclib.ProxyFileImport)
  }

  _get_proxy_file_export() {
    return this._get_proxy(jsonrpclib.ProxyFileExport)
  }

  _get_proxy(ProxyClass) {
    return new ProxyClass({
      baseURL: this.baseURL,
      timeout: this._timeout,
      deserialize: this.deserialize
    })
  }

  _get_proxy_json() {
    const proxy_json = this._get_proxy(jsonrpclib.ProxyJSON)
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

    return proxy_json
  }

  get proxy_json() {
    return this._proxy_json
  }

  get proxy_file_export() {
    return this._proxy_file_export
  }

  get proxy_file_import() {
    return this._proxy_file_import
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
