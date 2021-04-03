import { Model } from '../models'

export class SaleOrder extends Model {
  constructor() {
    super()
  }
}

const AddonsModels = {
  'sale.order': SaleOrder
}

export default AddonsModels
