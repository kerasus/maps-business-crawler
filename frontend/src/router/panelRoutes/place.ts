import type { RouteRecordRaw } from 'vue-router'
import hasOneOfThisRoles from 'src/router/middleware/hasOneOfThisRoles'

const routes: RouteRecordRaw[] = [
  {
    path: 'places',
    name: 'Panel.Place',
    meta: {
      pageCategory: 'اماکن',
      middleware: [hasOneOfThisRoles(['admin', 'manager', 'user'])]
    },
    component: () => import('src/layouts/BareLayout.vue'),
    children: [
      {
        path: '',
        name: 'Panel.Place.List',
        meta: { breadCrumbs: [{ label: 'لیست' }] },
        component: () => import('src/pages/panel/place/list.vue')
      },
      {
        path: 'create',
        name: 'Panel.Place.Create',
        meta: {
          breadCrumbs: [{ label: 'جدید' }],
          middleware: [hasOneOfThisRoles(['admin', 'manager'])]
        },
        component: () => import('src/pages/panel/place/create.vue')
      },
      {
        path: ':id',
        name: 'Panel.Place.Show',
        meta: { breadCrumbs: [{ label: 'مشاهده' }] },
        component: () => import('src/pages/panel/place/show.vue')
      },
      {
        path: ':id/edit',
        name: 'Panel.Place.Edit',
        meta: {
          breadCrumbs: [{ label: 'ویرایش' }],
          middleware: [hasOneOfThisRoles(['admin', 'manager'])]
        },
        component: () => import('src/pages/panel/place/edit.vue')
      }
    ]
  }
]

export default routes
