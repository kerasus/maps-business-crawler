import authRoutes from './auth'
import type { RouteRecordRaw } from 'vue-router'

export const index: RouteRecordRaw[] = [
  {
    path: '',
    // meta: {
    //   layoutConfig: {
    //     layoutHeader: true,
    //     layoutLeftDrawer: true,
    //     layoutRightDrawer: false,
    //     layoutFooter: false,
    //   },
    // },
    // name: 'HomePage',
    redirect: () => {
      // the function receives the target route as the argument
      // we return a redirect path/location here.
      return { name: 'Auth.Login' }
    }
    // component: () => import('src/pages/IndexPage.vue'),
  },
  {
    path: 'auth',
    meta: {
      layoutConfig: {
        layoutHeader: false,
        layoutLeftDrawer: false,
        layoutRightDrawer: false,
        layoutFooter: false
      }
    },
    component: () => import('src/layouts/BareLayout.vue'),
    children: [...authRoutes]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]
