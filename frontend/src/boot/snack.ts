import { boot } from 'quasar/wrappers'

export default boot(({ app }) => {
  if (typeof window !== 'undefined') {
    window.addEventListener('axios-store-handle-axios-error', (event: Event) => {
      const customEvent = event as CustomEvent
      const notifyMessage = customEvent.detail
      app.config.globalProperties.$q.notify({
        type: notifyMessage.type,
        color: notifyMessage.color,
        message: app.config.globalProperties.$t(notifyMessage.content),
        timeout: notifyMessage.timeout
      })
    })
  }
})
