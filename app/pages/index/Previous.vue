<script setup>
import { onMounted, ref } from 'vue'
import { getImageBase64FromUrl } from './utils'
import { useCreateToken } from './composables'

// Mainnet Beta: 101 | Testnet: 102 | Devnet: 103
const CHAIN_ID = "solana:103"

const { user, canvasClient } = defineProps(['user', 'canvasClient'])
const { createToken } = useCreateToken()

let imgs = ref()
const loading = ref(true)
const shouldMint = ref()
const loadingMint = ref()

onMounted(async () => {
  loading.value = true
  const response = await fetch('/api/previous')
  imgs.value = await response.json()
  for (let [idx, img] of Object.entries(imgs.value)) {
    imgs.value[idx].src = await getImageBase64FromUrl(img.winner)
  }
  shouldMint.value = imgs.value.some(img => 
    img.winner.likes.includes(user) &&
    !img.claimed.includes(user)
  )
  loading.value = false
})

async function mint(formData, index) {
  loadingMint.value = index

  const response = await canvasClient?.connectWallet(CHAIN_ID)

  if (response.untrusted.success == false) {
    loadingMint.value = false
    console.error("Failed to connect wallet", response.untrusted?.error)
    return
  }

  const createTokenResult = await createToken(formData, response.untrusted.address)
  if (createTokenResult.success === false) {
    loadingMint.value = false
    console.log(createTokenResult.message)
    return
  }

  const signedTxResults = await canvasClient.signAndSendTransaction({
    chainId: CHAIN_ID,
    unsignedTx: createTokenResult.transaction,
  })
  console.log(signedTxResults)

  if (signedTxResults.untrusted.success) {
    signedTx.value = signedTxResults.untrusted.signedTx
    console.log("Token created successfully!", signedTxResults.untrusted)

    await fetch('/api/claimed', {
      method: 'post',
      body: JSON.stringify({date: formData.date, user}),
      headers: {'Content-Type': 'application/json'}
    })

    shouldMint.value = false
  } else if (signedTxResults.untrusted.success === false) {
    console.error("Failed to create token", signedTxResults.untrusted.error)
  }
  loadingMint.value = false
}
</script>

<template>
  <h4>Previous Winners</h4>

  <div class="wrapper">
    <div v-for="(img, index) in imgs" class="img-container">
      <img :src="img.src" />
      <div>theme: {{ img.winner.theme }}</div>
      <div>date: {{ img.date }}</div>
      <div>prompt: {{ img.winner.prompt }}</div>
      <div>user: {{ img.winner.user }}</div>
      <button v-if="shouldMint" @click="mint(img, index)">
        <span class="loader small" v-if="loadingMint === index"></span>
        <template v-else>mint NFT ♡</template>
      </button>
    </div>
  </div>
  <p v-if="loading">Loading...</p>
  <p v-else-if="!imgs.length">Nothing to show yet...</p>
</template>

<style scoped>
.wrapper {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding-left: 10px;
}
.img-container {
  width: 33.333%;
}
button {
  margin-top: 10px;
}
</style>
