import api from '@/api_connect'

import { Database } from '@/api_connect/api_config'

export const test_api = async () => {
  // await login()
  // await test_get_sportType()
  // await test_get_bookvenue()
  await test_get_presetData()
}

const login = async () => {
  const username = 'admin'
  const password = '123456'

  const res = await api.login({
    db: Database,
    login: username,
    password: password
  })
  return res
}

const test_get_sportType = async () => {
  const model = 'res.partner'
  const Model = api.env.model(model)
  const records = await Model.get_sportType()

  console.log('room', 'records', records)

  const records2 = records.map(item => {
    return {
      id: item.id,
      name: item.name,
      floor: item.street,
      totalNum: item.child_ids.length, // 所有场地数, 不考虑时段及是否被预定
      introduction: item.comment
      // latestBook: null
    }
  })

  console.log('room2', records2)
}

const test_get_bookvenue = async () => {
  //
  const model = 'res.partner'
  const Model = api.env.model(model)
  const sportTypes = await Model.get_sportType()

  // 选择一项运动
  const sportType = sportTypes[0]
  const sportType_id = sportType.id

  // 根据 sportType_id 查询所有的 场地
  const records = await Model.get_bookvenue(sportType_id)
  console.log('venue:', records)

  const records2 = records.map(item => {
    return {
      id: item.id,
      type: sportType.ref,
      name: item.parent_id__name,
      num: item.name,
      msg: item.comment
    }
  })

  console.log('venue 2:', records2)

  //   const res_print = [
  //     { id: 9, type: 'pingpang', name: '乒乓球', num: '1号台', msg: false },
  //     { id: 10, type: 'pingpang', name: '乒乓球', num: '2号台', msg: false },
  //     { id: 11, type: 'badminton', name: '羽毛球', num: '1号场', msg: false },
  //     { id: 12, type: 'badminton', name: '羽毛球', num: '2号场', msg: false },
  //     { id: 13, type: 'badminton', name: '羽毛球', num: '3号场', msg: false }
  //   ]
}

const test_get_presetData = async () => {
  // 返回 预定场地时间数据

  const model1 = 'res.partner'
  const Model1 = api.env.model(model1)
  const sportTypes = await Model1.get_sportType()

  // 选择一项运动
  const sportType = sportTypes[0]
  const sportType_id = sportType.id

  // 根据 sportType_id 查询所有的 场地

  const venues = await Model1.get_bookvenue(sportType_id)

  // 选择一块场地
  const venue = venues[0]
  const address_id = venue.id

  const dates = [
    '2021-04-08',
    '2021-04-09',
    '2021-04-10',
    '2021-04-11',
    '2021-04-12',
    '2021-04-13'
  ]

  // 选择日期
  const date = dates[1]

  const HOUR_MIN = 8
  const HOUR_MAX = 20

  // 每日的有效时间段, 若不传, 则会取默认值 8-21
  const hour_min = HOUR_MIN
  const hour_max = HOUR_MAX

  const model = 'event.event'
  const Model = api.env.model(model)

  const records = await Model.search_future_event({
    address_id,
    date,
    hour_min,
    hour_max
  })
  console.log(records)

  const records2 = records.map(item => {
    return {
      id: item.id,
      address_id: item.address_id, // 场地 id, 对应 bookvenue
      address_id__name: item.address_id__name, // 场地名称, bookvenue 的 name + num
      date_begin: item.date_begin, // 开始时间
      date_end: item.date_end, // 结束时间
      seats_expected: item.seats_expected, // 0, 空闲, 1, 已经被预定
      reg_partner_id: item.reg_partner_id, // 被谁预定, false: 空闲
      reg_by_me: item.reg_by_me, // 被我预定, true: 我, false: 空闲或被别人预定
      isPreset: item.isPreset // 状态
    }
  })

  console.log(records2)

  //   const res_print = [
  //     {
  //       // address_id: 9
  //       // address_id__name: "乒乓球, 1号台"
  //       // date_begin: Sat Apr 03 2021 13:00:00 GMT+0800 (中国标准时间) {}
  //       // date_end: Sat Apr 03 2021 14:00:00 GMT+0800 (中国标准时间) {}
  //       // id: 124
  //       // isPreset: 2
  //       // reg_by_me: true
  //       // reg_partner_id: 3
  //       // seats_expected: 1
  //     },
  //     {
  //       // address_id: 9
  //       // address_id__name: "乒乓球, 1号台"
  //       // date_begin: Sat Apr 03 2021 14:00:00 GMT+0800 (中国标准时间) {}
  //       // date_end: Sat Apr 03 2021 15:00:00 GMT+0800 (中国标准时间) {}
  //       // id: 125
  //       // isPreset: 0
  //       // reg_by_me: false
  //       // reg_partner_id: 1
  //       // seats_expected: 1
  //     },
  //     {
  //       // address_id: 9
  //       // address_id__name: "乒乓球, 1号台"
  //       // date_begin: Sat Apr 03 2021 15:00:00 GMT+0800 (中国标准时间) {}
  //       // date_end: Sat Apr 03 2021 16:00:00 GMT+0800 (中国标准时间) {}
  //       // id: 126
  //       // isPreset: 1
  //       // reg_by_me: false
  //       // reg_partner_id: undefined
  //       // seats_expected: 0
  //     }
  //   ]
}

//

const test_xmldom = () => {
  //

  var DOMParser = require('xmldom').DOMParser
  var doc = new DOMParser().parseFromString(
    '<xml xmlns="a" xmlns:c="./lite">\n' +
      '\t<child>test</child>\n' +
      '\t<child></child>\n' +
      '\t<child/>\n' +
      '</xml>',
    'text/xml'
  )
  doc.documentElement.setAttribute('x', 'y')
  doc.documentElement.setAttributeNS('./lite', 'c:x', 'y2')
  var nsAttr = doc.documentElement.getAttributeNS('./lite', 'x')
  console.info(nsAttr)
  console.info(doc)
}

const test_schedule_event = async () => {
  // 查询 场馆时, 执行下这个函数
  // 自动创建 未来7天的 可预定场地
  // 若已经创建 则 这个函数仅仅检查是否已经存在
  const model = 'event.event'
  const Model = api.env.model(model)

  const loop_times = 2 // 调试用的, 每次只创建两条记录, 若为 null, 则全部创建
  const date_count = 7 // 自动创建的天数, 默认 未来 7天
  const hour_min = 8 // 每天第一场的时间, 默认 早8点
  const hour_max = 20 // 每天最后一场的时间, 默认晚上8点
  // const minute_count = 60  // 每场的时间长度 分钟数, 暂时不实现

  // 系统自动检查 当日此时下个整点时刻开始 到 未来7天后的23时止, 所有场地的所有可预定记录, 若无 则创建
  // 注意 若修改 hour_min, hour_max, 已创建的可预定场次, 将 有问题, 需要删除后, 才能 更改这个参数 重新创建

  await Model.schedule_event({ loop_times, date_count, hour_min, hour_max })
}
