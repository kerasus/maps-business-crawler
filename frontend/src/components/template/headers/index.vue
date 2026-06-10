<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { useAppLayout } from 'src/stores/appLayout'

withDefaults(defineProps<{ floated?: boolean }>(), {
  floated: false
})

const appLayoutStore = useAppLayout()

const MainPanelComponent = defineAsyncComponent(() => import('./mainPanel.vue'))
</script>

<template>
  <main-panel-component
    v-if="appLayoutStore.layoutHeaderType === 'mainPanel'"
    :floated="floated" />
</template>

<style scoped lang="scss"></style>
