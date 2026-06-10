import { boot } from 'quasar/wrappers'
import { useHeaderBreadCrumbs } from 'src/stores/headerBreadCrumbs'

export default boot(({ router }) => {
  const headerBreadCrumbsStore = useHeaderBreadCrumbs()

  // تابع برای یافتن pageCategory، breadCrumbs و routeName از والدین
  function findParentMeta (matchedRoutes) {
    let pageCategory = ''
    let breadCrumbs = ''
    let routeName = ''

    for (let i = matchedRoutes.length - 1; i >= 0; i--) {
      if (matchedRoutes[i].meta) {
        if (!pageCategory && matchedRoutes[i].meta.pageCategory) {
          pageCategory = matchedRoutes[i].meta.pageCategory
        }
        if (!breadCrumbs && matchedRoutes[i].meta.breadCrumbs) {
          breadCrumbs = matchedRoutes[i].meta.breadCrumbs
          routeName = matchedRoutes[i].name || '' // یافتن نام مسیر
        }
      }
      // اگر هر سه مقدار پیدا شدند، متوقف می‌شود
      if (pageCategory && breadCrumbs && routeName) break
    }

    return { pageCategory, breadCrumbs, routeName }
  }

  router.beforeEach((to, from, next) => {
    const { pageCategory, breadCrumbs, routeName } = findParentMeta(to.matched)

    headerBreadCrumbsStore.updateLayoutConfig({
      pageCategory: pageCategory || '',
      breadCrumbs: breadCrumbs || '',
      routeName: routeName || ''
    })

    next()
  })
})
