import { defineStore } from 'pinia'
import type { RouteLocationNormalized } from 'vue-router'

interface breadCrumb {
  label: string;
  to: undefined | RouteLocationNormalized;
}

export interface State {
  pageCategory: string;
  breadCrumbs: breadCrumb[];
  routeName: string;
}

export const useHeaderBreadCrumbs = defineStore('headerBreadCrumbs', {
  state: (): State => {
    return {
      pageCategory: '',
      breadCrumbs: [],
      routeName: ''
    }
  },
  actions: {
    updateLayoutConfig (config: Partial<State>) {
      if (config.pageCategory !== undefined) {
        this.pageCategory = config.pageCategory
      }
      if (config.breadCrumbs !== undefined) {
        this.breadCrumbs = config.breadCrumbs
      }
      if (config.routeName !== undefined) {
        this.routeName = config.routeName
      }
    }
  }
})
