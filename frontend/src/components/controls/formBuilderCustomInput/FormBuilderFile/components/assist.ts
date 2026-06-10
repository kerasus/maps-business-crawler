export function isImageFile (file : File): boolean {
  if (file instanceof File) {
    return file.type.startsWith('image/')
  }
  return false
}

export function isImageSrcUrl (SrcUrl : string | undefined): boolean {
  if (typeof SrcUrl === 'string') {
    return /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(SrcUrl)
  }
  return false
}

export function getBase64Image (
  imageFile: File,
  callback: (base46: string)=>void = () => {}
) {
  const reader = new FileReader()
  reader.readAsDataURL(imageFile)
  reader.onload = () => {
    const base64 = reader.result as string
    callback(base64)
  }
  reader.onerror = (error) => {
    console.error('Error reading file:', error)
  }
}

export function formatFileSize (size: number): string {
  if (size < 1024) {
    return `${Math.floor(size)} کیلوبایت`
  } else {
    return `${(size / 1024).toFixed(2)} مگابایت`
  }
}
