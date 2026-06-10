<script setup lang="ts">
import { formatFileSize } from './assist'
import FileIconComponent from './fileIcon.vue'
import type { SavedSourcesType } from '../index.vue'
import { defineEmits, ref } from 'vue'
import ImagePreview from 'src/components/cards/imagePreview.vue'
import { useImageSrc } from './useImageSrc'

const props = withDefaults(
  defineProps<{
    file?: File;
    srcUrl?: string;
    srcObj?: SavedSourcesType;
    label?: string;
  }>(),
  {
    file: undefined,
    srcUrl: '',
    srcObj: undefined,
    label: ''
  }
)

const imagePreviewDialog = ref(false)
const emit = defineEmits<{ (e: 'delete', file: File | string | SavedSourcesType): void }>()

const { imageSrc } = useImageSrc(props.file, props.srcUrl, props.srcObj)

function deleteFile () {
  if (props.file) {
    emit('delete', props.file)
  } else if (props.srcUrl) {
    emit('delete', props.srcUrl)
  } else if (props.srcObj) {
    emit('delete', props.srcObj)
  }
}

function downloadFile (file: File) {
  const fileUrl = URL.createObjectURL(file)
  const fileName = file.name
  fetch(fileUrl)
    .then((response) => response.blob())
    .then((blob) => {
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = fileName
      link.click()
      URL.revokeObjectURL(blobUrl)
    })
    .catch((error) => {
      console.error('Error downloading file:', error)
    })
}

function showImagePreviewDialog () {
  imagePreviewDialog.value = true
}

function closeImagePreviewDialog () {
  imagePreviewDialog.value = false
}

function extractFileNameFromSrcUrl (url: string) {
  const regex = /\/([^/?]+)\?/
  const match = url.match(regex)
  return match ? match[1] : null
}
</script>

<template>
  <div class="flex q-pa-sm file-preview justify-between items-center no-wrap">
    <div class="image-preview">
      <file-icon-component
        :file="file"
        :src-url="srcUrl"
        :src-obj="srcObj">
        <template #visibility>
          <q-btn
            icon="oms:eye"
            flat
            class="show-image icon-button"
            @click="showImagePreviewDialog" />
        </template>
        <template #download>
          <q-btn
            v-if="file"
            class="icon-button"
            flat
            icon="oms:document"
            @click="downloadFile(file)" />
        </template>
      </file-icon-component>
      <q-dialog v-model="imagePreviewDialog">
        <image-preview
          :title="label"
          :src="imageSrc"
          @cancel="closeImagePreviewDialog" />
      </q-dialog>
    </div>
    <div class="flex details">
      <div class="details-container">
        <div class="file-name ellipsis full-width">
          <template v-if="file?.name">
            {{ file?.name }}
          </template>
          <template v-else-if="srcObj?.name">
            {{ srcObj?.name }}
          </template>
          <template v-else-if="srcUrl">
            {{ extractFileNameFromSrcUrl(srcUrl) }}
          </template>
        </div>
        <div class="file-size ellipsis">
          <q-chip
            v-if="srcUrl"
            class="tag hasUploadedFile-tag text-info"> آپلود شده </q-chip>
          <template v-if="file?.size">
            {{ formatFileSize(file.size / 1024) }}
          </template>
          <template v-else>
            {{ srcObj ? formatFileSize(srcObj.size / 1024) : '' }}
          </template>
        </div>
      </div>
    </div>
    <div class="flex delete-file-action-column">
      <q-btn
        icon="oms:close"
        class="icon-button"
        flat
        @click="deleteFile" />
      <!-- <div @click="downloadFile(file)">
        <q-icon name="cake"
                class="q-pa-sm" />
      </div> -->
    </div>
  </div>
</template>

<style scoped lang="scss">
$icon-preview-width: $space-10;
$icon-delete-width: $space-10;
.file-preview {
  width: 100%;
  position: relative;
  background-color: $neutral-95;
  @include radius-2;

  .image-preview {
    width: $space-10;
    height: $space-10;
    cursor: pointer;
    position: relative;

    :deep(.q-img) {
      width: 100%;
      height: 100%;
      object-fit: cover;
      @include radius-2;
    }

    .show-image {
      position: absolute;
      color: $color-white;
      font-size: $space-6;
      top: calc(50% - $space-10 + $space-2);
      right: 0;
    }
  }

  .details {
    width: calc(100% - $icon-delete-width - $icon-preview-width);
    padding: $spacing-none $space-4;

    .details-container {
      display: flex;
      flex-flow: column;
      justify-content: space-between;
      width: 100%;

      .file-name {
        width: 100%;
        color: $color-text1;
        margin-bottom: $space-2;
        @include typo-label-3;
      }

      .file-size {
        width: 100%;
        min-height: $space-6;
        color: $color-text3;
        @include typo-body-5;
      }
    }
  }
}
</style>
