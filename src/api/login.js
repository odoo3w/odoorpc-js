import api from '@/api_connect'

import { Database } from '@/api_connect/api_config'

const schedule_event = async () => {
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

export const login = async ({ username, password }) => {
  const res = await api.login({
    db: Database,
    login: username,
    password: password
  })

  // if (res) {
  //   await schedule_event()
  // }

  return res
}
