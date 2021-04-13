import { Model } from '../models'

const kanban = `
<templates name="form_view_child_ids" model="res.partner">
  <div name="title">
    <field name="name" />
  </div>
  <div >
    <img src="" alt="" ><field name="image_128" /></img>
  </div>
</templates >
`

export class ResPartner extends Model {
  constructor() {
    super()
  }

  get_templates(node, field) {
    // console.log('get_templates', node, field)
    if (field === 'child_ids') {
      return kanban
    }
  }
}

const AddonsModels = {
  'res.partner': ResPartner
}

export default AddonsModels
