import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

export const constantRoutes = [
  // Home
  {
    path: '/',
    component: Layout,
    redirect: '/home',

    children: [
      {
        path: '/home',
        component: () => import('@/views/home/index'),
        name: 'Home'
      }
    ]
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = []

// 创建路由
const createRouter = () => {
  // console.log('createRouter 1')

  const routers = [...constantRoutes]

  return new Router({
    // mode: 'history', // require service support
    scrollBehavior: () => ({ y: 0 }),
    routes: routers
    // routes: [...constantRoutes]
    // routes: [...constantRoutes, odooRouter]
  })
}

const router = createRouter()

// // Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
// export function resetRouter() {
//   const newRouter = createRouter()
//   router.matcher = newRouter.matcher // reset router
// }

export default router
