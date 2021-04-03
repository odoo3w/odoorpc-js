import api from '@/api_connect'

export const get_presetData = async () => {
  const model = 'event.event'
  const Model = api.env.model(model)
  const ids = await Model.search_future_event()
  const records = await Model.browse(ids)
  const records2 = records.fetch_all()

  console.log('records3', records2)

  const Reg = api.env.model('event.registration')

  const event_reg_ids = await Reg.search_by_event(records.ids)
  const event_regs = await Reg.browse(event_reg_ids)
  const event_regs2 = event_regs.fetch_all()

  const event_regs3 = event_regs2.reduce((acc, cur) => {
    acc[cur.event_id] = cur
    return acc
  }, {})

  console.log('event_regs', event_regs3, api.session_info.partner_id)

  const records3 = records2.map(item => {
    const seats_expected = item.seats_expected // 0, 空闲, 1, 已经被预定
    const reg_partner_id = (event_regs3[item.id] || {}).partner_id
    const reg_by_me = reg_partner_id === api.session_info.partner_id

    const get_isPreset = () => {
      if (seats_expected === 0) {
        return 1 // 空闲
      } else if (reg_by_me) {
        return 2 // 我已经预定
      } else {
        return 0 // 被别人预定
      }
    }

    const isPreset = get_isPreset()

    return {
      id: item.id,
      address_id: item.address_id, // 场地 id, 对应 bookvenue
      address_id__name: item.address_id__name, // 场地名称, bookvenue 的 name + num
      date_begin: item.date_begin, // 开始时间
      date_end: item.date_end, // 结束时间
      seats_expected, // 0, 空闲, 1, 已经被预定
      reg_partner_id, // 被谁预定, false: 空闲
      reg_by_me, // 被我预定, true: 我, false: 空闲或被别人预定
      isPreset
    }
  })

  return records3
}
