import type { RouteRecordRaw } from 'vue-router'
import { index as panelRoutes } from 'src/router/panelRoutes/index'
import { index as publicRoutes } from 'src/router/publicRoutes/index'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    meta: {
      layoutConfig: {
        layoutView: 'lHh Lpr lFf',
        layoutHeader: true,
        layoutHeaderType: 'mainPanel',
        layoutHeaderVisible: true,
        layoutHeaderReveal: false,
        layoutHeaderElevated: false,
        layoutHeaderBordered: false,
        layoutLeftDrawer: true,
        layoutLeftDrawerType: 'mainPanel',
        layoutLeftDrawerVisible: true,
        layoutLeftDrawerOverlay: false,
        layoutLeftDrawerElevated: false,
        layoutLeftDrawerBordered: false,
        layoutLeftDrawerShowIfAbove: false,
        layoutLeftDrawerMiniToOverlay: false,
        layoutLeftDrawerWidth: 237,
        layoutLeftDrawerMiniWidth: 72,
        layoutLeftDrawerBehavior: 'desktop',
        layoutRightDrawer: true,
        layoutRightDrawerType: 'mainPanel',
        layoutRightDrawerElevated: true,
        layoutFooter: false,
        showHamburgerBtn: true,
        layoutFooterVisible: true,
        layoutFooterElevated: false,
        layoutFooterType: 'mainPanel',
        layoutHeaderCustomClass: '',
        layoutBreadcrumbsElements: [],
        layoutBreadcrumbs: {
          separator: 'home'
        },
        layoutLeftDrawerCustomClass: '',
        layoutPageContainerCustomClass: ''
      }
    },
    component: () => import('layouts/MainLayout.vue'),
    children: [...publicRoutes, ...panelRoutes]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
