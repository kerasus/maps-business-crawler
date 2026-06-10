<script setup lang="ts">
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'
import { useUser } from 'src/stores/user'
import { useAppLayout } from 'stores/appLayout'
import ListItem from './components/listItem.vue'
import { computed, ref, watch } from 'vue'
import { useAppConfig } from 'stores/appConfig'

const $q = useQuasar()
const route = useRoute()
const userManager = useUser()
const appLayoutStore = useAppLayout()
const appConfigManager = useAppConfig()

const searchValue = ref('')

type ListItemType = {
  icon: string;
  title: string;
  route?: { name: string, params?: Record<string, string> };
  forRoles?: string[];
  child?: ListItemType[];
};

const topLinks = ref<ListItemType[]>([
  {
    icon: 'dashboard',
    title: 'داشبورد',
    route: { name: 'Panel.Dashboard' }
  },
  {
    icon: 'place',
    title: 'اماکن',
    forRoles: ['admin', 'manager', 'user'],
    route: { name: 'Panel.Place.List' }
  },
  {
    icon: 'label',
    title: 'برچسب‌ها',
    forRoles: ['admin', 'manager', 'user'],
    route: { name: 'Panel.Tag.List' }
  },
  {
    icon: 'group',
    title: 'کاربران',
    forRoles: ['admin', 'manager'],
    route: { name: 'Panel.User.List' }
  }
])

const allowedLinks = computed(() => topLinks.value.filter((link) => {
  if (!link.forRoles) {
    return true
  }
  return link.forRoles.some((role) => userManager.hasRole(userManager.me, role))
}))

const filterLinks = computed(() => {
  if (!searchValue.value) {
    return allowedLinks.value
  }
  return allowedLinks.value.filter((link) => link.title.includes(searchValue.value))
})

const currentRouteName = computed(() => route.name)

watch(currentRouteName, () => {
  if ($q.screen.lt.md) {
    appLayoutStore.layoutLeftDrawerVisible = false
  }
}, { immediate: true })
</script>

<template>
  <div class="left-drawer">
    <div class="left-drawer__inner">
      <div class="left-drawer__logo-section">
        <div class="left-drawer__logo-section-img">
          <q-img src="/images/logo.png" />
        </div>
      </div>
      <q-separator />
      <q-scroll-area class="scroll-area">
        <q-list padding>
          <list-item
            :items="filterLinks"
            :mini="appLayoutStore.layoutLeftDrawerMini" />
        </q-list>
      </q-scroll-area>
      <div class="left-drawer__copyright-section">
        <div class="app-version">v: {{ appConfigManager.version }}</div>
        <div class="copy-right">
          <span>Maps Crawler</span>
          <span> &copy; {{ new Date().getFullYear() }} </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.left-drawer {
  background: $gray-100;
  width: 100%;
  height: 100%;

  .left-drawer__inner {
    background: $gray-100;
    padding: $space-4 $space-2;
    border-radius: 0 $radius-6 $radius-6 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: column;

    .left-drawer__logo-section {
      margin-bottom: $space-9;
      min-height: $space-7;
      padding-left: $space-4;

      .left-drawer__logo-section-img {
        width: 100%;
        max-width: 140px;
      }
    }

    :deep(.scroll-area) {
      flex: 1;
    }

    .left-drawer__copyright-section {
      padding-left: $space-4;
      color: #67748e;
      font-size: 11px;
      direction: rtl;
      text-align: left;
    }
  }
}
</style>
