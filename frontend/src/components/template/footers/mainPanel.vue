<script setup lang="ts">

import { useAppConfig } from 'stores/appConfig'

const appConfig = useAppConfig()
</script>

<template>
  <div class="main-dashboard">
    <span class="app-version">
      {{ $t('app.version') }}: {{ appConfig.version }}
    </span>
    <span class="copy-right">
      &copy; {{ new Date().getFullYear() }} {{ $t("app.title") }}
    </span>
  </div>
</template>

<style scoped lang="scss">
.main-dashboard {
  padding: $space-1 $space-2;
  background: $neutral-99;
  display: flex;
  justify-content: space-between;
  border-top: solid 1px $grey-2;
  .copy-right {
    color: $grey-7;
    // @include typo-lable;
  }
  .app-version {
    color: $grey-6;
    // @include typo-lable;
  }
}
</style>
