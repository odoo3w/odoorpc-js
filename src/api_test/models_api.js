import { ResPartner } from './models_odoo'
export class ResCustomer extends ResPartner {
  constructor() {
    super()
  }

  static search() {
    console.log('search in ResCustomer')
    console.log('before call super search')
    super.search()
    console.log('after call super search')
  }

  static search_code() {
    console.log('search_code in ResCustomer')
    console.log('before call  search')
    this.search()
    console.log('after call  search')
  }
}
