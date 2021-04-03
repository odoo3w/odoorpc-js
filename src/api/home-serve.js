import api from '@/api_connect'

export const get_sportType = async () => {
  const model = 'res.partner'
  const Model = api.env.model(model)
  const ids = await Model.search_location_room()
  const records = await Model.browse(ids)
  const records2 = records.fetch_all()
  const records3 = records2.map(item => {
    return {
      id: item.id,
      name: item.name,
      floor: item.street,
      totalNum: item.child_ids.length, // 所有场地数, 不考虑时段及是否被预定
      introduction: item.comment
      // latestBook: null
    }
  })
  // console.log('records3', records3)
  return records3
}
