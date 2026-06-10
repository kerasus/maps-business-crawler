import type { RouteRecordRaw } from 'vue-router'
import hasOneOfThisRoles from 'src/router/middleware/hasOneOfThisRoles'

const routes: RouteRecordRaw[] = [
  {
    path: 'tags',
    name: 'Panel.Tag',
    meta: {
      pageCategory: 'برچسب‌ها',
      middleware: [hasOneOfThisRoles(['admin', 'manager', 'user'])]
    },
    component: () => import('src/layouts/BareLayout.vue'),
    children: [
      {
        path: '',
        name: 'Panel.Tag.List',
        meta: { breadCrumbs: [{ label: 'لیست' }] },
        component: () => import('src/pages/panel/tag/list.vue')
      },
      {
        path: 'create',
        name: 'Panel.Tag.Create',
        meta: {
          breadCrumbs: [{ label: 'جدید' }],
          middleware: [hasOneOfThisRoles(['admin', 'manager'])]
        },
        component: () => import('src/pages/panel/tag/create.vue')
      },
      {
        path: ':id',
        name: 'Panel.Tag.Show',
        meta: { breadCrumbs: [{ label: 'مشاهده' }] },
        component: () => import('src/pages/panel/tag/show.vue')
      },
      {
        path: ':id/edit',
        name: 'Panel.Tag.Edit',
        meta: {
          breadCrumbs: [{ label: 'ویرایش' }],
          middleware: [hasOneOfThisRoles(['admin', 'manager'])]
        },
        component: () => import('src/pages/panel/tag/edit.vue')
      }
    ]
  }
]

export default routes
