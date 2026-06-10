import { boot } from 'quasar/wrappers'
import { useUser } from 'src/stores/user'
import type { QSsrContext } from '@quasar/app-vite'
import type { Pinia, StoreDefinition } from 'pinia'
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'

export type MiddlewareContext = {
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
  store: Pinia,
  ssrContext: QSsrContext | null | undefined,
  sharedStore: {
    useUser: StoreDefinition
  }
}

export default boot(({ router }) => {
  router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    const middleware = to.meta.middleware

    if (!middleware) {
      return next()
    }

    const middlewareArray = Array.isArray(middleware) ? middleware : [middleware]

    let passRoute = null
    for (const middlewareFn of middlewareArray) {
      if (typeof middlewareFn === 'function') {
        passRoute = middlewareFn({ to, from, next, sharedStore: { useUser } })
        if (passRoute) {
          return next(passRoute)
        }
      }
    }

    return next()
  })
})
