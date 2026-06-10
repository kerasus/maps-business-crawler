import { defineStore } from 'pinia'
import { computed, reactive } from 'vue'
import { version as appVersion } from '../../package.json'
import {
  useRoute,
  type RouteLocationRaw,
  type RouteRecordNameGeneric
} from 'vue-router'

export const useAppConfig = defineStore('appConfig', () => {
  const route = useRoute()
  const state: {
    redirectAfterLogin: RouteLocationRaw | null,
    currencyUnit: string
  } = reactive({
    redirectAfterLogin: null,
    currencyUnit: 'ریال'
  })
  const version = computed(() => appVersion)
  const redirectAfterLogin = computed(() => state.redirectAfterLogin)
  const currencyUnit = computed(() => state.currencyUnit)

  function isLoginPage (routeName: RouteRecordNameGeneric): boolean {
    return routeName === 'Auth.Login'
  }

  function setCurrentRouteToRedirectAfterLogin (): void {
    if (!route || isLoginPage(route.name)) {
      return
    }
    state.redirectAfterLogin = { name: route.name, params: route.params, query: route.query }

    if (route.hash) {
      state.redirectAfterLogin.hash = route.hash
    }
  }

  return {
    version,
    currencyUnit,
    redirectAfterLogin,
    setCurrentRouteToRedirectAfterLogin
  }
})
