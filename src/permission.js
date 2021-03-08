import router from './router'

import api from '@/api'

const whiteList = [
  '/user/login', //
  '/user/register',
  '/user/resetpsw'
] // no redirect whitelist

router.beforeEach(async (to, from, next) => {
  if (whiteList.includes(to.path)) {
    next()
  } else {
    const hasToken = await api.session_check()
    if (hasToken) {
      next()
    } else {
      next(`/user/login?redirect=${to.path}`)
    }
  }
})

router.afterEach(() => {})
