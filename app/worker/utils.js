export { imageUrlToBlob, base64toBuffer }

import { Buffer } from 'node:buffer'

async function imageUrlToBlob(imageUrl) {
  try {
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return await response.blob()
  } catch (error) {
    console.error('Error converting image to Base64:', error)
    throw error
  }
}

function base64toBuffer(base64Image) {
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '')
  return Buffer.from(base64Data, 'base64')
}
