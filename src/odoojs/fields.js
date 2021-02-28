import { parseTime } from './utils'

const image2url = (baseURL, model, res_id, field) => {
  // const baseURL = process.env.VUE_APP_BASE_API
  const imgUrl = '/web/image'
  if (!res_id) {
    return ''
  }

  const now = parseTime(new Date(), '{y}{m}{d}{h}{i}{s}')

  return `${baseURL}${imgUrl}?model=${model}&id=${res_id}&field=${field}&unique=${now}`
}

const tuples2ids = (tuples = [], ids0 = []) => {
  //
  const ids = tuples.reduce((acc, value) => {
    if (value[0] === 6 && value[2]) {
      acc = new Set(value[2] || [])
    } else if (value[0] === 5) {
      acc = new Set([])
    } else if ([4, 0, 1].includes(value[0]) && value[1]) {
      acc.add(value[1])
    } else if ([3, 2].includes(value[0]) && value[1]) {
      acc.delete(value[1])
    }
    return acc
  }, new Set(ids0))

  return [...ids]
}

// def tuples2ids(tuples, ids):
//     """Update `ids` according to `tuples`, e.g. (3, 0, X), (4, 0, X)..."""
//     for value in tuples:
//         if value[0] == 6 and value[2]:
//             ids = value[2]
//         elif value[0] == 5:
//             ids[:] = []
//         elif value[0] in [4, 0, 1] and value[1] and value[1] not in ids:
//             ids.append(value[1])
//         elif value[0] in [3, 2] and value[1] and value[1] in ids:
//             ids.remove(value[1])

//     return ids

class BaseField {
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

  _get_readonly(instance) {
    //
  }

  value(instance) {
    let value = instance._values[this.name][instance.id]
    const parent_in_writed = Object.keys(instance._values_to_write[this.name])
    if (parent_in_writed.includes(instance.id)) {
      value = instance._values_to_write[self.name][instance.id]
    }
    return value

    // return [value, ...instance._ids]
    // [instance.constructor._name, instance.id, this.name]
  }

  setValue(instance, value) {
    console.log(
      ' field set:',
      this.name,
      instance.constructor._name,
      instance.id,
      value
    )
    //
  }
}

class Binary extends BaseField {
  constructor(name, data) {
    super(name, data)
  }

  value(instance) {
    const url = image2url(
      instance.constructor._odoo.baseURL,
      instance.constructor._name,
      instance.id,
      this.name
    )

    return url
  }
}

class Boolean2 extends BaseField {
  constructor(name, data) {
    super(name, data)
  }
}

class Char extends BaseField {
  constructor(name, data) {
    super(name, data)
  }
}

class Date2 extends BaseField {
  constructor(name, data) {
    super(name, data)
  }

  value(instance) {
    let value = instance._values[this.name][instance.id]
    const parent_in_writed = Object.keys(instance._values_to_write[this.name])
    if (parent_in_writed.includes(instance.id)) {
      value = instance._values_to_write[self.name][instance.id]
    }

    if (value) {
      return new Date(value)
    } else {
      return value
    }

    // return [instance.id, this.name, value]
  }
}

class Datetime extends BaseField {
  constructor(name, data) {
    super(name, data)
  }

  value(instance) {
    let value = instance._values[this.name][instance.id]
    const parent_in_writed = Object.keys(instance._values_to_write[this.name])
    if (parent_in_writed.includes(instance.id)) {
      value = instance._values_to_write[self.name][instance.id]
    }

    function parseDate(dateString) {
      const [date, time] = dateString.split(' ')
      return new Date(`${date}T${time}.000Z`) // Z = UTC
    }

    if (value) {
      return parseDate(value)
    } else {
      return value
    }

    // return [instance.id, this.name, value]
  }
}

class Float extends BaseField {
  constructor(name, data) {
    super(name, data)
  }

  value(instance) {
    let value = instance._values[this.name][instance.id]
    const parent_in_writed = Object.keys(instance._values_to_write[this.name])
    if (parent_in_writed.includes(instance.id)) {
      value = instance._values_to_write[self.name][instance.id]
    }
    return value ? value : 0.0
  }
}

class Integer extends BaseField {
  constructor(name, data) {
    super(name, data)
    this.selection = data.selection || false
  }
  value(instance) {
    let value = instance._values[this.name][instance.id]
    const parent_in_writed = Object.keys(instance._values_to_write[this.name])
    if (parent_in_writed.includes(instance.id)) {
      value = instance._values_to_write[self.name][instance.id]
    }
    return value ? value : 0
  }
}

class Selection2 extends BaseField {
  constructor(name, data) {
    super(name, data)
  }
}

class Many2many extends BaseField {
  constructor(name, data) {
    super(name, data)
    this.relation = data.relation || false
    this.context = data.context || {}
    this.domain = data.domain || false
  }

  async value(instance) {
    let ids = instance._values[this.name][instance.id]
    const parent_in_writed = Object.keys(instance._values_to_write[this.name])
    if (parent_in_writed.includes(instance.id)) {
      const values = instance._values_to_write[self.name][instance.id]
      ids = tuples2ids(values, ids || [])
    }

    const Relation = instance.env.model(this.relation)

    const get_env = () => {
      if (!this.context) {
        return instance.env
      }
      const context = { ...instance.env.context, ...this.context }
      return instance.env.copy(context)
    }

    const kwargs = { from_record: [instance, self] }
    return Relation._browse(get_env(), ids, kwargs)
  }
}

class Many2one extends BaseField {
  constructor(name, data) {
    super(name, data)
    this.relation = data.relation || false
    this.context = data.context || {}
    this.domain = data.domain || false
  }
  async value(instance) {
    let value = instance._values[this.name][instance.id]
    const parent_in_writed = Object.keys(instance._values_to_write[this.name])
    if (parent_in_writed.includes(instance.id)) {
      value = instance._values_to_write[self.name][instance.id]
    }
    const id_ = value

    const Relation = instance.env.model(this.relation)

    const get_env = () => {
      if (!this.context) {
        return instance.env
      }
      const context = { ...instance.env.context, ...this.context }
      return instance.env.copy(context)
    }

    const kwargs = { from_record: [instance, self] }
    return Relation._browse(get_env(), id_ || false, kwargs)
  }
}

class One2many extends BaseField {
  constructor(name, data) {
    super(name, data)
    this.relation = data.relation || false
    this.context = data.context || {}
    this.domain = data.domain || false
  }

  async value(instance) {
    let ids = instance._values[this.name][instance.id]
    const parent_in_writed = Object.keys(instance._values_to_write[this.name])
    if (parent_in_writed.includes(instance.id)) {
      const values = instance._values_to_write[self.name][instance.id]
      ids = tuples2ids(values, ids || [])
    }

    const Relation = instance.env.model(this.relation)

    const get_env = () => {
      if (!this.context) {
        return instance.env
      }
      const context = { ...instance.env.context, ...this.context }
      return instance.env.copy(context)
    }

    const kwargs = { from_record: [instance, self] }
    return Relation._browse(get_env(), ids, kwargs)
  }
}

export class Reference extends BaseField {
  constructor(name, data) {
    super(name, data)
    this.context = data.context || {}
    this.domain = data.domain || false
    this.selection = data.selection || false
  }

  value(instance) {
    let value = instance._values[this.name][instance.id]
    const parent_in_writed = Object.keys(instance._values_to_write[this.name])
    if (parent_in_writed.includes(instance.id)) {
      value = instance._values_to_write[self.name][instance.id]
    }

    if (value) {
      const [relation2, o_id2] = value.split(',')
      const relation = relation2.trim()
      const o_id = parseInt(o_id2)
      if (relation && o_id) {
        //
        const Relation = instance.env.model(relation)

        const get_env = () => {
          if (!this.context) {
            return instance.env
          }
          const context = { ...instance.env.context, ...this.context }
          return instance.env.copy(context)
        }

        const kwargs = { from_record: [instance, self] }
        return Relation._browse(get_env(), o_id, kwargs)
      }
    }

    return value

    // return [value, ...instance._ids]
    // [instance.constructor._name, instance.id, this.name]
  }
}

export class Text extends BaseField {
  constructor(name, data) {
    super(name, data)
  }
}

export class Html extends Text {
  constructor(name, data) {
    super(name, data)
  }
}

export class Unknown extends BaseField {
  constructor(name, data) {
    super(name, data)
  }
}

const TYPES_TO_FIELDS = {
  binary: Binary,
  boolean: Boolean2,
  char: Char,
  date: Date2,
  datetime: Datetime,
  float: Float,
  html: Html,
  integer: Integer,
  many2many: Many2many,
  many2one: Many2one,
  one2many: One2many,
  reference: Reference,
  selection: Selection2,
  text: Text
}

export const generate_field = (name, data) => {
  const Field2 = TYPES_TO_FIELDS[data.type]
  const Field = Field2 ? Field2 : Unknown

  const field = new Field(name, data)
  return field
}
