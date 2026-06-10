<template>
  <q-layout
    class="main-layout"
    :view="appLayoutStore.layoutView">
    <q-no-ssr>
      <q-header
        v-if="appLayoutStore.layoutHeader"
        :reveal="appLayoutStore.layoutHeaderReveal"
        :elevated="appLayoutStore.layoutHeaderElevated"
        :bordered="appLayoutStore.layoutHeaderBordered"
        :class="appLayoutStore.headerCustomClass">
        <header-component :floated="headerFloated" />
      </q-header>

      <q-drawer
        v-if="appLayoutStore.layoutLeftDrawer"
        v-model="appLayoutStore.layoutLeftDrawerVisible"
        :overlay="appLayoutStore.layoutLeftDrawerOverlay"
        :elevated="appLayoutStore.layoutLeftDrawerElevated"
        :bordered="appLayoutStore.layoutLeftDrawerBordered"
        :class="appLayoutStore.layoutLeftDrawerCustomClass"
        :mini="appLayoutStore.layoutLeftDrawerMini"
        :mini-width="appLayoutStore.layoutLeftDrawerMiniWidth"
        :mini-to-overlay="appLayoutStore.layoutLeftDrawerMiniToOverlay"
        :behavior="appLayoutStore.layoutLeftDrawerBehavior"
        :width="appLayoutStore.layoutLeftDrawerWidth"
        :show-if-above="appLayoutStore.layoutLeftDrawerShowIfAbove"
        side="left"
        class="main-layout__left-drawer">
        <left-drawer-component />
      </q-drawer>

      <q-drawer
        v-if="appLayoutStore.layoutRightDrawer"
        v-model="appLayoutStore.layoutRightDrawerVisible"
        :overlay="appLayoutStore.layoutRightDrawerOverlay"
        :elevated="appLayoutStore.layoutRightDrawerElevated"
        :bordered="appLayoutStore.layoutRightDrawerBordered"
        :class="appLayoutStore.rightDrawerCustomClass"
        :behavior="appLayoutStore.layoutRightDrawerBehavior"
        :width="appLayoutStore.rightDrawerWidth"
        :show-if-above="appLayoutStore.layoutRightDrawerShowIfAbove"
        side="right"
        class="main-layout__right-drawer">
        <right-drawer-component />
      </q-drawer>

      <q-page-container>
        <q-page
          v-scroll="onContentInsideScroll"
          :style-fn="myTweak">
          <router-view />
        </q-page>
      </q-page-container>

      <q-footer
        v-if="appLayoutStore.layoutFooter"
        ref="footerRef"
        :reveal="appLayoutStore.layoutFooterReveal"
        :elevated="appLayoutStore.layoutFooterElevated"
        :bordered="appLayoutStore.layoutFooterBordered"
        :class="appLayoutStore.footerCustomClass">
        <footer-component />
      </q-footer>
    </q-no-ssr>
  </q-layout>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { useAppLayout } from 'src/stores/appLayout'
import footerComponent from 'src/components/template/footers/index.vue'
import headerComponent from 'src/components/template/headers/index.vue'
import leftDrawerComponent from 'src/components/template/leftDrawers/index.vue'
import rightDrawerComponent from 'src/components/template/rightDrawers/index.vue'
import { onMounted, onUnmounted, ref, watch, type ComponentPublicInstance } from 'vue'

defineOptions({
  name: 'MainLayout'
})

const $q = useQuasar()

const footerRef = ref<ComponentPublicInstance | null>(null)
const headerFloated = ref<boolean>(false)

const appLayoutStore = useAppLayout()

function myTweak (offset: number) {
  appLayoutStore.layoutPageOffset = offset
  // "offset" is a Number (pixels) that refers to the total
  // height of header + footers that occupies on screen,
  // based on the QLayout "view" prop configuration

  // this is actually what the default style-fn does in Quasar
  return { minHeight: offset ? `calc(100vh - ${offset}px)` : '100vh' }
}

function onContentInsideScroll (data: number) {
  headerFloated.value = data > 0
}

function showAxiosInterceptorsResponseError (event: CustomEvent) {
  const messages: string[] = []
  const message: string | { loc: string; type: string }[] = event.detail.message
  if (typeof message === 'string') {
    messages.push(message)
  } else {
    message.forEach((item: { loc: string; type: string }) => {
      messages.push(item.type)
    })
  }

  const joinedMessages = messages.join('</br>')

  $q.notify({
    classes: 'snack--negative snack--inline-action',
    icon: 'info',
    message: joinedMessages,
    html: true,
    multiLine: true,
    timeout: 20000,
    actions: [
      {
        icon: 'close',
        class: 'icon-button',
        handler: () => {
          /* ... */
        }
      }
    ]
  })
}

watch(()=>$q.screen.lt.md, (ltmd) => {
  if (ltmd) {
    appLayoutStore.layoutLeftDrawerMini = false
    appLayoutStore.layoutLeftDrawerVisible = false
  } else {
    appLayoutStore.layoutLeftDrawerMini = false
    appLayoutStore.layoutLeftDrawerVisible = true
  }
}, {
  immediate: true
})

onMounted(() => {
  // Add an event listener when the component is mounted
  window.addEventListener(
    'axios-interceptors-response-error',
    showAxiosInterceptorsResponseError as EventListener
  )

  setTimeout(() => {
    if (footerRef.value) {
      appLayoutStore.layoutFooterHeight = footerRef.value.$el.clientHeight
    }
  }, 500)
})

onUnmounted(() => {
  // Clean up the event listener when the component is unmounted
  window.removeEventListener(
    'axios-interceptors-response-error',
    showAxiosInterceptorsResponseError as EventListener
  )
})
</script>

<style lang="scss" scoped>
.main-layout {
  background: $color-background;
  min-height: 100vh;
  :deep(.q-drawer-container) {
    .q-drawer--right {
      .q-layout__shadow {
        &:after {
          box-shadow:
            0 0 10px 2px rgba(0, 0, 0, 0),
            0 0 10px rgba(53, 84, 209, 0.24);
        }
      }
    }
    .q-drawer--left {
      z-index: 2001;
      .q-layout__shadow {
        &:after {
          box-shadow:
            0 0 10px 2px rgba(255, 255, 255, 0.2),
            0 0 10px rgba(53, 84, 209, 0.24);
        }
      }
    }
  }
  :deep(.q-layout__section--marginal) {
    background: transparent;
  }
  .q-page {
    display: flex;
    flex-direction: column;
    padding: $space-4;
  }
}
</style>
