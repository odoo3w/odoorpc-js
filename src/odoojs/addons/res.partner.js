import { Model } from '../models'

export class ResPartner extends Model {
  constructor() {
    super()
  }
}

const AddonsModels = {
  'res.partner': ResPartner,
}

export default AddonsModels
