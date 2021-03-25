export class Model {
  constructor() {
    //
  }
  static search() {
    console.log('search in Model')
  }
}

export class ResPartner extends Model {
  constructor() {
    super()
  }

  static search() {
    console.log('search in ResPartner')
    console.log('before call super search')
    // super.search()
    console.log('after call super search')
  }

  static search_code() {
    console.log('search_code in ResPartner')
    console.log('before call  search')
    this.search()
    console.log('after call  search')
  }
}

export class SaleOrder extends Model {
  constructor() {
    super()
  }

  static search() {
    console.log('search in SaleOrder')
    console.log('before call super search')
    super.search()
    console.log('after call super search')
  }

  static search_code() {
    console.log('search_code in SaleOrder')
    console.log('before call  search')
    this.search()
    console.log('after call  search')
  }
}

const Models = {
  Model,
  ResPartner,
  SaleOrder
}

export default Models
