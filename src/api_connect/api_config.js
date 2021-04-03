// 这里配置服务端地址

// Host Name

// 部署时的正式地址
// export const baseURL = 'http://39.103.161.215:8069'

// 调试时, 避免跨域, 使用这个地址
export const baseURL = process.env.VUE_APP_BASE_API

// 将代码 移植到 小程序中时, 注意 使用 正确的 baseURL

// Database Name
export const Database = 'reservation'

// /view/test/test_api.vue 这个文件为 book系统 调试 页面

// 移植到小程序中时, 需要的文件:
// 文件夹 odoojs
// 文件夹 api_connect
// 文件夹 api
// api 中的函数是 接口函数

// api/test-api.js 中有所有 api 的 调用示例
