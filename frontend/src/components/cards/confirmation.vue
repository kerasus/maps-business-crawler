<template>
  <q-card class="dialog confirmation-card">
    <q-card-section
      class="confirmation-header"
      :class="{ 'confirmation-icon': icon }">
      <q-icon
        v-if="icon"
        :name="icon"
        :class="'text-' + titleColor" />
      <div
        class="title"
        :class="'text-' + titleColor">
        {{ $t(title ? title : '') }}
      </div>
    </q-card-section>
    <q-card-section class="confirmation-content">
      <slot>
        {{ $t(message ? message : '') }}
      </slot>
    </q-card-section>
    <q-card-section class="confirmation-buttons">
      <q-btn
        v-if="submitLabel"
        :label="$t(submitLabel)"
        :loading="loading"
        color="primary"
        class="submit-btn"
        @click="submit" />
      <q-btn
        v-if="cancelLabel"
        :label="$t(cancelLabel)"
        :disable="loading"
        color="secondary"
        outline
        class="cancel-btn"
        @click="cancel" />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { defineEmits } from 'vue'

export interface ConfirmationProps {
  title?: string | undefined;
  message?: string | undefined;
  submitLabel?: string | undefined;
  cancelLabel?: string | undefined;
  icon?: string | null | undefined;
  titleColor?: string | undefined;
  loading?: boolean | undefined;
}

defineProps<ConfirmationProps>()

const emit = defineEmits(['submit', 'cancel'])

const submit = (event: Event) => {
  emit('submit', event)
}

const cancel = (event: Event) => {
  emit('cancel', event)
}
</script>

<style scoped lang="scss">
.confirmation-card {
  width: 458px;
  .q-card__section {
    padding: $spacing-none;
    border-radius: unset;
    &.confirmation-header {
      display: flex;
      flex-flow: row nowrap;
      justify-content: start;
      align-items: center;
      .title {
        color: $color-text1;
        @include typo-title-2;
      }
      &.confirmation-icon {
        justify-content: center;
        gap: $space-4;
        .q-icon {
          color: $neutral-30;
          font-size: $space-6;
        }
      }
    }
    &.confirmation-content {
      margin: $space-4 $spacing-none;
      color: $color-text2;
      @include typo-body-4;
    }
    &.confirmation-buttons {
      display: flex;
      gap: $space-4;
      .q-btn {
        &.submit-btn {
          width: 100%;
        }
      }
    }
  }
  @include media-max-width('lg') {
    & {
      width: 328px;
    }
  }
}
</style>
