import { Model } from '@/odoojs/models'

const DATE_COUNT = 7
const HOUR_MIN = 8
const HOUR_MAX = 20

const dateHelper = {
  // hour_min: 8,
  // hour_max: 20,
  str00: value => value.toString().padStart(2, '0'),
  date2str: function(date) {
    const yyyy = this.str00(date.getFullYear())
    const mm = this.str00(date.getMonth() + 1)
    const dd = this.str00(date.getDate())
    return `${yyyy}-${mm}-${dd}`
  },

  toUTCString: function(date) {
    const yyyy = this.str00(date.getUTCFullYear())
    const mm = this.str00(date.getUTCMonth() + 1)
    const dd = this.str00(date.getUTCDate())
    const hh = this.str00(date.getUTCHours())

    return `${yyyy}-${mm}-${dd} ${hh}:00:00`
  },

  new_hour: (date, hour) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour),

  first_date: date => new Date(date.getFullYear(), date.getMonth(), 1),
  date_add: (date, day) => new Date(date.getTime() + 1000 * 60 * 60 * 24 * day),
  hour_add: (date, hour) => new Date(date.getTime() + 1000 * 60 * 60 * hour),

  get_date: date => {
    const date1 = new Date(date)
    const this_first = this.first_date(date1)
    const this_last = this.date_add(
      this.first_date(this.date_add(this_first, 40)),
      -1
    )
    const date_from = this.date2str(this_first)
    const date_to = this.date2str(this_last)

    return [date_from, date_to]
  }
}

const get_hours = ({ date_count, hour_min, hour_max }) => {
  const now = new Date()

  const all_days1 = Array.from(new Array(date_count).keys())
  const all_days = all_days1.map(item => dateHelper.date_add(now, item))
  const hours = Array.from(new Array(24).keys()).filter(
    item => item >= hour_min && item <= hour_max
  )

  const all_day_hours = all_days.reduce((acc, day) => {
    const oneday_hours = hours.map(item => dateHelper.new_hour(day, item))
    return [...acc, ...oneday_hours]
  }, [])

  const all_hours = all_day_hours.filter(item => item > new Date())

  const all_hours2 = all_hours.map(item => {
    return {
      date_begin: item,
      date_end: dateHelper.hour_add(item, 1)
    }
  })

  const utc_hours = all_hours2.map(item => {
    return {
      date_begin: dateHelper.toUTCString(item.date_begin),
      date_end: dateHelper.toUTCString(item.date_end)
    }
  })

  return utc_hours
}

export class EventEvent extends Model {
  constructor() {
    super()
  }
  static async search_event_type() {
    const model = 'event.type'
    const Model = this.env.model(model)
    const domain = [['name', '=', 'reservation']]
    const res = await Model.search(domain)
    return res[0]
  }

  static async search_location() {
    const model = 'res.partner'
    const Model = this.env.model(model)
    const room_ids = await Model.search_location_area()
    const rooms = await Model.name_get(room_ids)
    // console.log(room_ids, rooms)
    return rooms
  }

  static async create_by_values(vals) {
    // const callback = res => {
    //   // console.log('call back, read', res)
    // }

    const rec = await this.browse(null, {
      // fetch_one: callback
    })

    rec.$name = vals.name
    rec.$date_begin = vals.date_begin
    rec.$date_end = vals.date_end
    rec.$address_id = vals.address_id
    rec.$event_type_id = vals.event_type_id
    await rec.awaiter
    await rec.commit()
    // console.log(rec)
    return rec.id
  }

  static async get_schedule_event({ date_count, hour_min, hour_max }) {
    const event_type_id = await this.search_event_type()
    const rooms = await this.search_location()
    const hours = get_hours({ date_count, hour_min, hour_max })
    // console.log('rooms ', rooms)
    // console.log('hours ', hours)

    const events = hours.reduce((acc, hour) => {
      const hs = rooms.reduce((acc2, address) => {
        acc2.push({
          name: `${address[1]} ${hour.date_begin.substr(0, 13)}`,
          event_type_id,
          address_id: address[0],
          ...hour
        })
        return acc2
      }, [])

      return [...acc, ...hs]
    }, [])

    return events
  }

  static async schedule_event(payload = {}) {
    const {
      loop_times = 1,
      date_count = DATE_COUNT,
      hour_min = HOUR_MIN,
      hour_max = HOUR_MAX
    } = payload

    let loops = loop_times || 100000

    const values_list = await this.get_schedule_event({
      date_count,
      hour_min,
      hour_max
    })
    // console.log('event', values_list)
    const event_ids = []
    for (const vals of values_list) {
      // console.log('event', vals)
      const domain = [
        ['address_id', '=', vals.address_id],
        ['date_begin', '=', vals.date_begin]
      ]
      const ids = await this.search(domain, { limit: 1 })
      if (ids.length) {
        event_ids.push(ids[0])
        continue
      }
      const event_id = await this.create_by_values(vals)
      event_ids.push(event_id)

      loops = loops - 1
      if (loops > 0) {
        continue
      } else {
        break
      }
    }

    return event_ids
  }

  static async search_future_event() {
    const event_type_id = await this.search_event_type()

    const now = new Date()
    const utc_now = dateHelper.toUTCString(now)

    const domain = [
      ['event_type_id', '=', event_type_id],
      ['date_begin', '>', utc_now]
    ]
    const ids = await this.search(domain, { order: 'date_begin, address_id' })
    // console.log(' ids', ids)
    return ids
  }
}

export class EventRegistration extends Model {
  static async search_by_event(event_ids) {
    const domain = [['event_id', 'in', event_ids]]
    const ids = await this.search(domain)
    // console.log(' ids', ids)
    return ids
  }
}

const AddonsModels = {
  'event.event': EventEvent,
  'event.registration': EventRegistration
}

export default AddonsModels

const test_write = async () => {
  const model = 'event.event'

  const Model = api.env.model(model)

  //   const domain = [['id', '=', 1]]
  const domain = []

  const ids = await Model.search(domain, { limit: 1 })
  console.log(ids)

  const callback = res => {
    console.log('call back, read', res)
  }

  const res = await Model.browse(ids, {
    fetch_one: callback
  })
  console.log(res)
  console.log(res.$state)
  //   console.log(res.$address_id)
  //   console.log(res.$event_type_id)

  const event_type = res.$event_type_id

  res.execute('button_confirm')

  //   console.log('event_type_id', event_type.id)
  //   const event_type_id = event_type.id

  //   console.log('event_type_id', event_type_id)

  //   res.$event_type_id = event_type_id

  //   await res.awaiter
  //   console.log(res)

  //   res.commit()

  //   res.$event_type_id
}

const test_read = async () => {
  //
  //   const model = 'res.partner'
  const model = 'event.event'

  const Model = api.env.model(model)

  //   const domain = [['id', '=', 1]]
  const domain = []

  const ids = await Model.search(domain, { limit: 1 })
  console.log(ids)

  const callback = res => {
    console.log('call back, read', res)
  }

  const res = await Model.browse(ids, {
    fetch_one: callback
  })
  console.log(res)
  console.log(res.$name)

  console.log(res.fetch_all())

  //   //   console.log(res.fetch_all())
  //   //   const add = res.$address_id
  //   //   console.log(add)
  //   //   console.log(add.fetch_one())
  //   //   console.log(add.$display_name)

  //   const o2m = res.$event_mail_ids
  //   console.log(o2m.ids)
}
