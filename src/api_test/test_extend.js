function mix(...mixins) {
  class Mix {
    constructor() {
      for (let mixin of mixins) {
        copyProperties(this, new mixin()) // 拷贝实例属性
      }
    }
  }

  for (let mixin of mixins) {
    copyProperties(Mix, mixin) // 拷贝静态属性
    copyProperties(Mix.prototype, mixin.prototype) // 拷贝原型属性
  }

  return Mix
}

function copyProperties(target, source) {
  for (let key of Reflect.ownKeys(source)) {
    console.log('in mix', key)
    if (key !== 'constructor' && key !== 'prototype' && key !== 'name') {
      let desc = Object.getOwnPropertyDescriptor(source, key)
      console.log('in mix 2', key, desc)
      Object.defineProperty(target, key, desc)
    }
  }
}

export class NewClass extends mix(ResPartner, ResCustomer) {
  //
}
