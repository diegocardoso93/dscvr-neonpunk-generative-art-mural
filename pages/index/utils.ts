
export { getImageBase64FromUrl, resizeBase64Image }

async function getImageBase64FromUrl(img) {
  const response = await fetch(`/api/images/?url=${img.url}`)
  const blob = await response.blob()
  return `data:image/jpeg;base64,${await imageUrlToBase64(blob)}`
}

async function imageUrlToBase64(blob) {
  try {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onloadend = () => {
        if (!reader.result) resolve(null)
        if (reader.result) {
          const base64String = reader.result.toString().split(',')[1]
          resolve(base64String)
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    });
  } catch (error) {
    console.error('Error converting image to Base64:', error)
    throw error
  }
}

function resizeBase64Image(base64String, newWidth, newHeight) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = newWidth
      canvas.height = newHeight
      ctx.drawImage(img, 0, 0, newWidth, newHeight)

      const resizedBase64 = canvas.toDataURL('image/png')
      resolve(resizedBase64)
    }

    img.src = base64String
  })
}
