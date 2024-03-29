import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Layout from '@/layout'
import Space from '@/layout/space'

const userRoutes = [
  // user
  {
    path: '/user',
    component: Space,
    children: [
      {
        path: '/user/login',
        component: () => import('@/views/user'),
        name: 'user-login'
      },
      {
        path: '/test',
        component: () => import('@/views/test/test'),
        name: 'user-login'
      }
    ]
  }
]

const homeRoutes = [
  // Home
  {
    path: '/',
    component: Layout,
    redirect: '/home',
    children: [
      {
        path: '/home',
        component: () => import('@/views/home'),
        name: 'home'
      },
      {
        path: '/web',
        component: () => import('@/views/home/web'),
        name: 'web'
      },
      {
        path: '/test/api2',
        component: () => import('@/views/test/test_api'),
        name: 'test-api'
      },
      {
        path: '/test/select',
        component: () => import('@/views/test/select'),
        name: 'test-select'
      },
      {
        path: '/test/select2',
        component: () => import('@/views/test/select2'),
        name: 'test-select2'
      },
      {
        path: '/test/form',
        component: () => import('@/views/test/form'),
        name: 'test-form'
      }
    ]
  }
]
const allRoutes = [
  ...userRoutes,
  ...homeRoutes
  //   ...listRoutes,
  //   ...viewRoutes,
  //   ...formRoutes,
  //   ...listReportRoutes,
  //   ...viewReportRoutes
]

// 创建路由
const createRouter = () => {
  const routers = [...allRoutes]

  return new Router({
    // mode: 'history', // require service support
    scrollBehavior: () => ({ y: 0 }),
    routes: routers
  })
}

const router = createRouter()

export default router
