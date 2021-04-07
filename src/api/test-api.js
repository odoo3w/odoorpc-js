import api from '@/api_connect'

import { Database } from '@/api_connect/api_config'

export const test_api = async () => {
  // await login()
  // await test_get_sportType()
  // await test_get_bookvenue()
  // await test_get_presetData()
  // await test_reg_event()
  // test_register_mobile()
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

const test_reg_event = async () => {
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

  const model2 = 'event.event'
  const Model2 = api.env.model(model2)

  // 根据 address_id,date 查询所有的 可预定
  const events = await Model2.search_future_event({
    address_id,
    date,
    hour_min,
    hour_max
  })

  // 选择 一个预定
  const event = events[1]
  const event_id = event.id

  const model = 'event.registration'
  const Model = api.env.model(model)

  const reg = await Model.reg_event(event_id)

  console.log(reg)
}

const all_users = [
  '13621007080',
  '13910679928',
  '15801252316',
  '13911469690',
  '13911132711',
  '13811033313',
  '13811535766',
  '18911899712',
  '13522808997',
  '13683292391',
  '13611054306',
  '13661248928',
  '13001294650',
  '13718049661',
  '18810779632',
  '13426057008',
  '18210121077',
  '18611839706',
  '13811057639',
  '13693523682',
  '18001226715',
  '13910604413',
  '13683398123'
]

const test_register_mobile = async () => {
  const model = 'res.users'
  const Model = api.env.model(model)
  console.log([Model])
  for (const mobile of all_users) {
    // const mobile = '13911223366'
    // const user = await Model.register_mobile(mobile)
    // console.log(mobile)
    // console.log(user)
  }
}
