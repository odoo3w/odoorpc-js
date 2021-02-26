export class BaseField {
  constructor(name, data) {
    this.name = name
    this.type = data.type || false
    this.string = data.string || false
    this.size = data.size || false
    this.required = data.required || false
    this.readonly = data.readonly || false
    this.help = data.help || false
    this.states = data.states || false
  }

  value(instance) {
    let value = instance._values[this.name][instance.id]
    const ids = Object.keys(instance._values_to_write[this.name])
    if (ids.includes(instance.id)) {
      value = instance._values_to_write[self.name][instance.id]
    }
    return [value, ...instance._ids]
    // [instance.constructor._name, instance.id, this.name]
  }
}

export class Char extends BaseField {
  constructor(name, data) {
    super(name, data)
  }
}

export class Many2one extends BaseField {
  constructor(name, data) {
    super(name, data)
    this.relation = data.relation || false
    this.context = data.context || {}
    this.domain = data.domain || false
  }
  async value(instance) {
    let value = instance._values[this.name][instance.id]
    const ids = Object.keys(instance._values_to_write[this.name])
    if (ids.includes(instance.id)) {
      value = instance._values_to_write[self.name][instance.id]
    }
    const id_ = value

    // console.log('field GET:', instance.constructor._odoo)
    return ['async', this.relation, this.name, id_]
  }
}

export class Unknown extends BaseField {
  constructor(name, data) {
    super(name, data)
  }
}

const TYPES_TO_FIELDS = {
  //   binary: Binary,
  //   boolean: Boolean,
  char: Char,
  //   date: Date,
  //   datetime: Datetime,
  //   float: Float,
  //   html: Html,
  //   integer: Integer,
  //   many2many: Many2many,
  many2one: Many2one
  //   one2many: One2many,
  //   reference: Reference,
  //   selection: Selection
  //   text: Text
}

export const generate_field = (name, data) => {
  //
  //   console.log('generate_field', name, data)
  const Field = Object.keys(TYPES_TO_FIELDS).includes(data.type)
    ? TYPES_TO_FIELDS[data.type]
    : Unknown
  const field = new Field(name, data)
  return field
}
