<script setup lang="ts">
import type { ValidationRule } from 'quasar'
import { formatFileSize } from './components/assist'
import FormBuilderFilePreview from './components/FormBuilderFilePreview.vue'
import { ref, type ComponentPublicInstance, computed, watch, nextTick } from 'vue'

defineOptions({
  name: 'FormBuilderFile'
})

interface QFileComponent extends ComponentPublicInstance {
  pickFiles: () => void;
  resetValidation: () => void;
  hasError: boolean;
}
export interface SavedSourcesType {
  name: string;
  path: string;
  size: number;
}

const props = withDefaults(
  defineProps<{
    label?: string;
    multiple?: boolean;
    rules?: Array<ValidationRule> | undefined;
  }>(),
  {
    label: '',
    multiple: false,
    rules: undefined
  }
)
const value = defineModel('value', {
  required: true,
  type: [File, String, Object, null],
  default: () => []
})

const isDragging = ref(false)
const selectedFiles = ref<File[]>([])
const savedSources = ref<string[]>([])
const input = ref<QFileComponent | null>(null)
const savedSourcesObject = ref<SavedSourcesType[]>([])

const qFileInputModelValue = computed({
  get () {
    return selectedFiles.value
  },
  set (newValue) {
    if (newValue instanceof File) {
      selectedFiles.value = [newValue]
    } else if (newValue instanceof FileList) {
      selectedFiles.value = newValue
    }

    if (props.multiple) {
      value.value = selectedFiles.value
    } else {
      value.value = selectedFiles.value[0]
    }
  }
})

const sizeRuleValue = computed(() => {
  if (!props.rules) {
    return null
  }

  const seizeRuleIndex = props.rules.findIndex((rule: any) => rule.ruleName === 'size')

  if (seizeRuleIndex === -1) {
    return null
  }

  const sizeRule = props.rules[seizeRuleIndex]
  // @ts-ignore
  const sizeRuleParam = sizeRule.ruleParams[0]

  if (!sizeRuleParam) {
    return null
  }

  return formatFileSize(parseInt(sizeRuleParam))
})

const hasUploadedFiles = computed(() => {
  return savedSourcesObject.value.length > 0 || savedSources.value.length > 0
})

function isSavedSourcesType (obj: any): obj is SavedSourcesType {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.name === 'string' &&
    typeof obj.path === 'string' &&
    typeof obj.size === 'number'
  )
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  if (event.dataTransfer?.files) {
    const files = event.dataTransfer.files
    if (props.multiple) {
      processFiles(files)
    } else {
      selectedFiles.value = []
      processFiles(files[0])
    }
  }
}

const processFiles = (fileList: FileList | File | undefined) => {
  if (!fileList) {
    return
  }

  let files: File[]

  if (fileList instanceof File) {
    files = [fileList]
  } else {
    files = Array.from(fileList)
  }

  const fileArray = files.filter((file) => !selectedFiles.value.some((f) => f.name === file.name))
  fileArray.forEach((file) => {
    selectedFiles.value.push(file)
  })
  loadValueFromSelectedFile()
}

function loadValueFromSelectedFile () {
  if (props.multiple) {
    value.value = selectedFiles.value
  } else {
    value.value = selectedFiles.value[0]
  }
}

function select () {
  savedSourcesObject.value = []
  savedSources.value = []
  selectedFiles.value = []
  loadValueFromSelectedFile()

  nextTick(() => {
    if (input.value) {
      input.value.pickFiles()
    }
  })
}

function onUpdateQFile (fileList: FileList | File) {
  processFiles(fileList)
  clearSavedSources()
}

function atClickRemoveFileBtn (file: File | string | SavedSourcesType) {
  if (file instanceof File) {
    removeFile(file)
  }
}

function atClickRemoveSrcUrlBtn (file: File | string | SavedSourcesType) {
  if (typeof file === 'string') {
    removeSrcUrl(file)
  }
}

function atClickRemoveSrcObjBtn (file: File | string | SavedSourcesType) {
  if (isSavedSourcesType(file)) {
    removeSrcObj(file)
  }
}

function removeFile (file: File) {
  const targetIndex = selectedFiles.value.findIndex(
    (selectedFile) => selectedFile.name === file.name
  )

  if (targetIndex === -1) {
    return
  }
  selectedFiles.value.splice(targetIndex, 1)
  loadValueFromSelectedFile()
}

function removeSrcUrl (srcUrl: string) {
  const targetIndex = savedSources.value.findIndex((savedSources) => savedSources === srcUrl)
  if (targetIndex === -1) {
    return
  }
  savedSources.value.splice(targetIndex, 1)
}

function removeSrcObj (srcObj: SavedSourcesType) {
  const targetIndex = savedSourcesObject.value.findIndex(
    (savedSourcesObject) => savedSourcesObject === srcObj
  )
  if (targetIndex === -1) {
    return
  }
  savedSourcesObject.value.splice(targetIndex, 1)
}

function clearSavedSources () {
  if (!props.multiple) {
    savedSources.value = []
    savedSourcesObject.value = []
  }
}

watch(
  () => value.value,
  (newValue) => {
    if (!newValue || (Array.isArray(newValue) && newValue.length === 0)) {
      selectedFiles.value = []
      savedSources.value = []
      savedSourcesObject.value = []
      return
    }

    let target = newValue
    if (!Array.isArray(newValue)) {
      target = [newValue]
    }

    if (target[0] instanceof File) {
      selectedFiles.value = target
    } else if (typeof target[0] === 'string') {
      savedSources.value = target
    } else if (isSavedSourcesType(target[0])) {
      savedSourcesObject.value = target
    }
  },
  {
    immediate: true
  }
)
</script>

<template>
  <div class="form-builder-file-picker">
    <div
      class="column items-center justify-center uploader"
      @dragover.prevent
      @drop.prevent="handleDrop"
      @dragenter="isDragging = true"
      @dragleave="isDragging = false">
      <q-icon
        name="oms:gallery-import"
        color="black" />
      <div class="full-width row no-wrap items-center justify-between">
        <div class="column">
          <div class="uploader__title">
            {{ label }}
          </div>
        </div>
        <q-btn
          class="no-wrap"
          color="secondary"
          type="a"
          outline
          dense
          @click="select">
          {{ $t('general.selectFile') }}
        </q-btn>
      </div>
      <div
        v-if="sizeRuleValue"
        class="maximum-size">
        {{ $t('general.maxFIleSize') }} {{ sizeRuleValue }}
      </div>
    </div>
    <q-file
      v-if="!hasUploadedFiles"
      ref="input"
      v-model="qFileInputModelValue"
      :rules="rules"
      :multiple="multiple"
      @update:model-value="onUpdateQFile" />
    <div class="body-preview">
      <form-builder-file-preview
        v-for="(file, fileIndex) in selectedFiles"
        :key="fileIndex"
        :file="file"
        :label="label"
        @delete="atClickRemoveFileBtn" />
      <form-builder-file-preview
        v-for="(srcUrl, fileIndex) in savedSources"
        :key="fileIndex"
        :src-url="srcUrl"
        :label="label"
        @delete="atClickRemoveSrcUrlBtn" />
      <form-builder-file-preview
        v-for="(srcObj, fileIndex) in savedSourcesObject"
        :key="fileIndex"
        :src-obj="srcObj"
        :label="label"
        @delete="atClickRemoveSrcObjBtn" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.form-builder-file-picker {
  border: 1px dashed $color-outline;
  margin-bottom: $space-4;
  position: relative;
  @include radius-2;
  .uploader {
    padding: $space-4 $space-4 $space-3 $space-4;
    .q-icon {
      font-size: $space-6;
      margin-bottom: $space-2;
    }
    .uploader__title {
      @include typo-body-3;
    }
    .maximum-size {
      color: $color-text3;
      margin-top: $space-2;
      @include typo-body-4;
    }
  }
  :deep(.q-file) {
    margin: $spacing-none;
    position: absolute;
    bottom: calc(-1 * #{$space-8});
    left: 0;
    width: 100%;
    .q-field__inner {
      .q-field__control {
        display: none;
      }
      .q-field__bottom {
        min-height: $spacing-none;
        &.q-field__bottom--animated {
          position: relative;
          transform: translateY(0);
        }
        .q-field__messages {
          div[role='alert'] {
            margin-bottom: $space-2;
          }
        }
      }
    }
  }
  .body-preview {
    min-height: $space-20;
    padding: 0 $space-4 $space-4 $space-4;
  }
}
</style>
