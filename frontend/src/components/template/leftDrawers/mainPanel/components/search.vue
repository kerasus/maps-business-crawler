<template>
  <q-input
    ref="input"
    v-model="value"
    class="search-input"
    :clearable="!menuToggle"
    :placeholder="$t('general.startSearching')">
    <template #prepend>
      <q-icon
        name="oms:search"
        color="white"
        @click="atClickSearchIcon" />
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { ref, defineEmits, computed } from 'vue'
import { useAppLayout } from 'stores/appLayout'

const value = defineModel('value', {
  type: String,
  default: ''
})
const input = ref<HTMLInputElement | null>(null)
const appLayoutStore = useAppLayout()
const menuToggle = computed(() => appLayoutStore.layoutLeftDrawerMini)
const emits = defineEmits(['click-icon'])

function atClickSearchIcon () {
  if (menuToggle.value) {
    emits('click-icon')
    input.value?.focus()
  }
}
</script>

<style lang="scss" scoped>
.search-input {
  margin-top: unset;
  margin-bottom: $space-1;
  :deep(.q-field__inner) {
    .q-field__control {
      .q-field__control-container {
        .q-field__native {
          color: $color-white;
          &::placeholder {
            color: $color-text2;
          }
        }
      }
      .q-field__append {
        .q-icon {
          &.q-field__focusable-action {
            opacity: 1;
          }
          &::before {
            color: $color-white;
          }
        }
      }
      &::before {
        border: unset;
      }
    }
  }
}
</style>
