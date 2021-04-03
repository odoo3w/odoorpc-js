import api from '@/api_connect'

export const get_bookvenue = async () => {
  const model = 'res.partner'
  const Model = api.env.model(model)
  const ids = await Model.search_location_area()
  const records = await Model.browse(ids)

  const records2 = records.fetch_all()
  const parent_ids2 = records2.map(item => item.parent_id)
  const parent_ids = Array.from(new Set(parent_ids2))

  //   console.log('parent_ids', parent_ids)

  const parents = await Model.browse(parent_ids)
  const parents2 = parents.fetch_all().reduce((acc, cur) => {
    acc[cur.id] = cur
    return acc
  }, {})

  //   console.log('records3', records2)

  const records3 = records2.map(item => {
    return {
      id: item.id,
      type: parents2[item.parent_id].ref,
      name: item.parent_id__name,
      num: item.name,
      msg: item.comment
    }
  })

  return records3
}
