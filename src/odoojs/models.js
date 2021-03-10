import { Model as WebModel } from './models_web.js'

import {
  is_virtual_id as is_virtual_id_base,
  IncrementalRecords as IncrementalRecords_base
} from './models_base.js'

export const is_virtual_id = is_virtual_id_base
export const IncrementalRecords = IncrementalRecords_base
export const Model = WebModel
