import { ref, type Ref, watchEffect } from 'vue'
import { getBase64Image, isImageFile, isImageSrcUrl } from './assist'
import type { SavedSourcesType } from '../index.vue'

export function useImageSrc (file?: File, srcUrl?: string, srcObj?: SavedSourcesType) {
  const imageSrc: Ref<string | undefined> = ref(undefined)

  watchEffect(() => {
    // If the file is an image, convert it to a base64 string
    if (file && file instanceof File && isImageFile(file)) {
      getBase64Image(file, (base64) => {
        imageSrc.value = base64
      })
    } else if (srcUrl) {
      // If a valid srcUrl is provided, return it
      imageSrc.value = srcUrl
    } else if (srcObj?.path && isImageSrcUrl(srcObj.path)) {
      // If srcObj contains a valid image path, return it
      imageSrc.value = srcObj.path
    } else {
      // Default to undefined if no valid image source is found
      imageSrc.value = undefined
    }
  })

  return {
    imageSrc
  }
}
