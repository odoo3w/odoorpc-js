import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Layout from '@/layout'

const userRoutes = [
  // user
  {
    path: '/user',
    component: Layout,
    children: [
      {
        path: '/user/login',
        component: () => import('@/views/user'),
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
        component: () => import('@/views/home/index2'),
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
