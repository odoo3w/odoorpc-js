import api from '@/api_connect'

import { login } from '@/api/login'
import { get_sportType } from '@/api/home-serve'
import { get_bookvenue } from '@/api/bookvenue-serve'
import { get_presetData } from '@/api/bookitem-serve'

export const test_api = async () => {
  //   await test_login()
  //   await test_schedule_event()
  //   await test_get_sportType()
  //   await test_get_bookvenue()
  // await test_get_presetData()
}

const test_login = async () => {
  const username = 'admin'
  const password = '123456'
  await login({ username, password })
  // 登陆后 , 有 cookie, 无需 重复登陆
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

const test_get_sportType = async () => {
  // 返回 项目类型
  const res = await get_sportType()
  console.log(res)

  //   const res_print = [
  //     { floor: '5', id: 7, introduction: '简介', name: '乒乓球', totalNum: 2 },
  //     { floor: '6', id: 8, introduction: false, name: '羽毛球', totalNum: 3 }
  //   ]
}

const test_get_bookvenue = async () => {
  //
  // 返回 预定场地
  const res = await get_bookvenue()
  console.log(res)

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
  const res = await get_presetData()
  console.log(res)

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
