<template>
  <q-tooltip
    :self="tooltipSelf"
    :class="tooltipClass"
    :anchor="tooltipAnchor"
    :max-width="tooltipMaxWidth">
    <slot />
  </q-tooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
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
const tooltipClass = computed(() => {
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
