<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { useAppLayout } from 'src/stores/appLayout'

const appLayoutStore = useAppLayout()

const MainPanelComponent = defineAsyncComponent(() => import('./mainPanel.vue'))
</script>

<template>
  <main-panel-component v-if="appLayoutStore.layoutRightDrawerType === 'mainPanel'" />
</template>

<style scoped lang="scss">

</style>
