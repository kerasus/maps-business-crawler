import { boot } from 'quasar/wrappers'
import { useAppLayout } from 'src/stores/appLayout'

export default boot(({ router }) => {
  const appLayoutStore = useAppLayout()
  router.beforeEach((to, from, next) => {
    to.matched
      .filter(item => item.meta?.layoutConfig)
      .forEach(({ meta }) => {
        Object.keys(meta.layoutConfig)
          .forEach((key) => {
            appLayoutStore[key] = meta.layoutConfig[key]
          })
      })
    next()
  })
})
