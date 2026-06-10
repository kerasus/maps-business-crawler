<template>
  <span
    class="currency-number"
    :class="{ 'text-green': showStatusColor && number >= 0, 'text-red': showStatusColor && number < 0 }">
    {{ formattedNumber }}
  </span>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  number: number,
  showStatusColor?: boolean
}>()

const formattedNumber = computed(() => {
  const isNegative = props.number < 0
  const absoluteNumber = Math.abs(props.number)

  const formatted = absoluteNumber
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return isNegative ? `-${formatted}` : formatted
})
</script>

<style scoped>
.currency-number {
  display: inline-block;
  /*rtl:ignore*/
  direction: ltr;
}
</style>
