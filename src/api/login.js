import api from '@/api_connect'

import { Database } from '@/api_connect/api_config'

export const login = async ({ username, password }) => {
  await api.login({
    db: Database,
    login: username,
    password: password
  })
}
