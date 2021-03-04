export const image2url = (model, res_id, field) => {
  const baseURL = process.env.VUE_APP_BASE_API
  const imgUrl = '/web/image'
  if (!res_id) {
    return ''
  }
  return `${baseURL}${imgUrl}?model=${model}&id=${res_id}&field=${field}`
}

export const new_list = len => {
  return Array.from(new Array(len).keys())
}

export function sleep(millisecond) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, millisecond)
  })
}

export const model_odoo2vuex = name =>
  name
    .replace(/(\.|^)[a-z]/g, L => L.toUpperCase())
    .replace(/\./g, '')
    .replace(/( |^)[A-Z]/g, L => L.toLowerCase())

export const model_vuex2odoo = name =>
  name.replace(/[A-Z]/g, L => `.${L.toLowerCase()}`)

/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
export function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if (typeof time === 'string' && /^[0-9]+$/.test(time)) {
      time = parseInt(time)
    }
    if (typeof time === 'number' && time.toString().length === 10) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    return value.toString().padStart(2, '0')
  })
  return time_str
}
