import userRoutes from './user'
import tagRoutes from './tag'
import placeRoutes from './place'
import type { RouteRecordRaw } from 'vue-router'
import Authenticated from 'src/router/middleware/Authenticated'
import hasOneOfThisRoles from 'src/router/middleware/hasOneOfThisRoles'

export const index: RouteRecordRaw[] = [
  {
    path: 'panel',
    meta: {
      middleware: [Authenticated]
    },
    component: () => import('src/layouts/BareLayout.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'Panel.Dashboard',
        meta: {
          pageCategory: 'داشبورد'
        },
        component: () => import('src/pages/panel/dashboard.vue')
      },
      ...userRoutes,
      ...tagRoutes,
      ...placeRoutes
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default index
