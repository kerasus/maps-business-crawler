<template>
  <q-card class="modal image-preview-card">
    <q-card-section class="image-preview-header">
      <div class="title">
        {{ $t(title ? title : '') }}
      </div>
      <q-btn
        icon="oms:close"
        flat
        class="icon-button"
        @click="cancel" />
    </q-card-section>
    <q-separator />
    <q-card-section class="image-preview-content">
      <q-img
        v-if="imageLoaded && src"
        :src="src" />
      <div
        v-else
        class="image-preview-error">
        <!-- ToDo: must change icon to gallery-slash-->
        <q-icon name="oms:gallery" />
        <div class="error-message">
          {{ $t('dialog.imagePreviewErrorMessage') }}
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { defineEmits, ref, watch } from 'vue'
const imageLoaded = ref(false)

const props = withDefaults(
  defineProps<{
    title?: string | null;
    src?: string;
  }>(),
  {
    title: undefined,
    src: undefined
  }
)

const emit = defineEmits(['cancel'])

const cancel = (event: Event) => {
  emit('cancel', event)
}

watch(
  () => props.src,
  (newSrc) => {
    imageLoaded.value = !!newSrc // Set to true if newSrc exists
  },
  {
    immediate: true
  }
)
</script>

<style scoped lang="scss">
.image-preview-card {
  min-width: 664px;
  .q-card__section {
    padding: $spacing-none;
    border-radius: unset;
    &.image-preview-header {
      padding: $space-1 $spacing-none;
      display: flex;
      flex-flow: row nowrap;
      justify-content: space-between;
      align-items: center;
      .title {
        color: $color-text1;
        font-size: 18px;
        font-style: normal;
        font-weight: 700;
        line-height: 24px;
        @include typo-title-1;
      }
    }
    &.image-preview-content {
      margin-top: $space-1;
      .q-img {
        width: 100%;
        height: 100%;
        .q-img__container {
          .q-img__image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
      }
      .image-preview-error {
        height: 362px;
        display: flex;
        flex-flow: column nowrap;
        justify-content: center;
        align-items: center;
        gap: $space-6;
        .q-icon {
          font-size: $space-12;
          color: $neutral-30;
        }
        .error-message {
          color: $color-text2;
          font-size: 12px;
          font-style: normal;
          font-weight: 500;
          line-height: 14px;
          letter-spacing: 0.06px;
        }
      }
    }
  }
}
//   .q-dialog__inner--minimized > div{
//     max-width: unset;
//   }
</style>
