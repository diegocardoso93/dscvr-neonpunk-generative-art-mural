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
const shouldMint = ref([])
const loadingMint = ref()
const showCelebration = ref()

onMounted(async () => {
  loading.value = true
  const response = await fetch('/api/previous')
  imgs.value = await response.json()
  for (let [idx, img] of Object.entries(imgs.value)) {
    imgs.value[idx].src = await getImageBase64FromUrl(img.winner)
  }
  shouldMint.value = imgs.value.filter(img =>
    !img.claimed.includes(user) && // not claimed yet 
    (img.winner.likes.includes(user) || img.winner.user == user) // user likes or is the creator
  ).map((img, i) => i)
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

  formData.address = response.untrusted.address;
  formData.user = user;

  const mintResult = await fetch(`/api/mint`, {
    method: "post",
    body: JSON.stringify(formData),
    headers: {'Content-Type': 'application/json'}
  })

  shouldMint.value = shouldMint.value.filter((x, i) => i != index)
  loadingMint.value = false
  showCelebration.value = true
  setTimeout(() => {
    showCelebration.value = false
  }, 5000);
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
      <button v-if="shouldMint.includes(index)" @click="mint(img, index)">
        <span class="loader xsmall" v-if="loadingMint === index"></span>
        <template v-else>mint NFT ♡</template>
      </button>
    </div>
  </div>
  <p v-if="loading">Loading...</p>
  <p v-else-if="!imgs.length">Nothing to show yet...</p>

  <Toastr
    v-if="showCelebration"
    title="Congratulations!! 🎉🎊"
    message="You received the asset in your Wallet"
  />
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
