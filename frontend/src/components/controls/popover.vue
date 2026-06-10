<template>
  <q-menu
    class="popover"
    :class="popoverClass"
    transition-show="flip-up"
    transition-hide="flip-down"
    :offset="[10, 10]"
    fit
    :anchor="tooltipAnchor"
    :self="tooltipSelf"
    :max-width="tooltipMaxWidth">
    <q-banner>
      <template #avatar>
        <q-icon
          v-close-popup
          name="oms:close" />
      </template>
      <slot name="title">
        {{ title }}
      </slot>
    </q-banner>
    <div class="q-pa-md popover-content">
      <slot />
    </div>
  </q-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title?: string;
  direction: string;
}>()

const tooltipSelf = computed(() => {
  const key = props.direction
  switch (key) {
    case 'bottom':
      return 'top middle'
    case 'left':
      return 'center right'
    case 'right':
      return 'center left'
    case 'top':
      return 'bottom middle'
    default:
      return 'top middle'
  }
})
const popoverClass = computed(() => {
  const key = props.direction
  switch (key) {
    case 'bottom':
      return 'bottom-position'
    case 'left':
      return 'left-position'
    case 'right':
      return 'right-position'
    case 'top':
      return 'top-position'
    default:
      return 'bottom-position'
  }
})
const tooltipAnchor = computed(() => {
  const key = props.direction
  switch (key) {
    case 'bottom':
      return 'bottom middle'
    case 'left':
      return 'center left'
    case 'right':
      return 'center right'
    case 'top':
      return 'top middle'
    default:
      return 'bottom middle'
  }
})

const tooltipMaxWidth = computed(() => {
  return '240px'
})
</script>
