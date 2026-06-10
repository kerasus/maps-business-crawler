<script setup lang="ts">
import { useImageSrc } from './useImageSrc'
import type { SavedSourcesType } from '../index.vue'

const props = defineProps<{
  file?: File;
  srcUrl?: string;
  srcObj?: SavedSourcesType;
}>()

const { imageSrc } = useImageSrc(props.file, props.srcUrl, props.srcObj)
</script>

<template>
  <q-img
    v-if="imageSrc"
    :src="imageSrc" />
  <slot
    v-if="imageSrc"
    name="visibility" />
  <slot
    v-else
    name="download" />
</template>
