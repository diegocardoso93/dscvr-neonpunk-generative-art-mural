export { imageUrlToBlob, base64toBuffer, convertStreamToArrayBuffer }

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

async function convertStreamToArrayBuffer(stream) {
  const reader = stream.getReader();
  const chunks = [];
  let totalLength = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      totalLength += value.length;
    }

    const arrayBuffer = new Uint8Array(totalLength);
    let position = 0;

    for (const chunk of chunks) {
      arrayBuffer.set(chunk, position);
      position += chunk.length;
    }

    return arrayBuffer.buffer;
  } catch (error) {
    console.error('Error while reading the stream:', error);
  }
}
