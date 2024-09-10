export function useCreateToken() {
  async function createToken(createTokenData, creatorWallet) {
    const data = { ...createTokenData, creatorWallet }
    let metadataResults = await uploadData(data)
    return metadataResults
  }

  async function uploadData(createData) {
    const resized = await resizeBase64Image(createData.src, 100, 100)
    createData.src = resized
    const response = await fetch(`/api/mint`, {
      method: "post",
      body: JSON.stringify(createData),
      headers: {'Content-Type': 'application/json'}
    })

    return await response.json()
  }

  return { createToken }
}
