import { Model } from '@/odoojs/models'

export class ResPartner extends Model {
  constructor() {
    super()
  }

  static async search_location(category) {
    const ids = await this.search([
      ['category_id.name', '=', category],
      ['category_id.parent_id.name', '=', 'location']
    ])

    return ids
  }

  static async search_location_room() {
    return this.search_location('room')
  }

  static async search_location_area() {
    const ids = await this.search([
      ['parent_id.category_id.name', '=', 'room'],
      ['parent_id.category_id.parent_id.name', '=', 'location']
    ])

    return ids
  }
}

const AddonsModels = {
  'res.partner': ResPartner
}

export default AddonsModels
