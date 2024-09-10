<script setup>
import { onMounted, ref } from 'vue'
import { getImageBase64FromUrl } from './utils';

const CHAIN_ID = "solana:101";

let imgs = ref()
const loading = ref(true)
const { user, canvasClient } = defineProps(['user', 'canvasClient'])
const shouldClaim = ref()
const loadingClaim = ref()

onMounted(async () => {
  loading.value = true
  const response = await fetch('/api/previous');
  imgs.value = await response.json()
  for (let [idx, img] of Object.entries(imgs.value)) {
    imgs.value[idx].src = await getImageBase64FromUrl(img.winner)
  }
  shouldClaim.value = imgs.value.some(img => img.winner.likes.includes(user))
  loading.value = false
})

async function claim() {
}

const useCreateToken = () => {
  const createToken = async (
    createToken,
    creatorWallet
  ) => {
    const { ...data } = { ...createToken, creatorWallet };
    let metadataResults = await uploadData(data);
    console.log({metadataResults});
    return metadataResults;
  };

  const uploadData = async (createData) => {
    console.log(createData.src)
    const resized = await resizeBase64Image(createData.src, 100, 100);
    createData.src = resized;
    const response = await fetch(`/api/mint`, {
      method: "post",
      body: JSON.stringify(createData),
      headers: {'Content-Type': 'application/json'}
    });
    console.log(response);

    const data = await response.json();
    return data;
  };

  return {
    createToken,
  };
};

const isLoading = ref();
const { createToken } = useCreateToken();

const submitCreateToken = async (formData) => {

isLoading.value = true;

const response = await canvasClient?.connectWallet(CHAIN_ID);

if (response.untrusted.success == false) {
  isLoading.value = false;
  console.error("Failed to connect wallet", response.untrusted?.error);
  return;
}

const createTokenResult = await createToken(
  formData,
  response.untrusted.address
);
if (createTokenResult.success === false) {
  isLoading.value = false;
  console.log(createTokenResult.message);
  return;
}

const signedTxResults = await canvasClient.signAndSendTransaction({
  chainId: CHAIN_ID,
  unsignedTx: createTokenResult.transaction,
});
console.log(signedTxResults);

if (signedTxResults.untrusted.success) {
  signedTx.value = signedTxResults.untrusted.signedTx;
  console.log("Token created successfully!", signedTxResults.untrusted);
} else if (signedTxResults.untrusted.success === false) {
  console.error("Failed to create token", signedTxResults.untrusted.error);
}
isLoading.value = false;
};

function resizeBase64Image(base64String, newWidth, newHeight) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      const resizedBase64 = canvas.toDataURL('image/png');
      
      resolve(resizedBase64);
    };

    img.src = base64String;
  })
}

</script>

<template>
  <h2>Neonpunk Generative Art Mural</h2>
  <h4>Previous Winners</h4>

  <div style="display: flex; flex-wrap: wrap;justify-content: center;padding-left: 10px;">
    <div class="img-container" v-for="img in imgs">
      <img :src="img.src" />
      <div>date: {{ img.date }}</div>
      <div>prompt: {{ img.winner.prompt }}</div>
      <div>user: {{ img.winner.user }}</div>
      <button @click="submitCreateToken(img)">mint NFT ♡</button>
    </div>
  </div>
  <p v-if="loading">Loading...</p>
  <p v-else-if="!imgs.length">Nothing to show yet...</p>
</template>

<style scoped>
.img-container {
  width: 33.333%;
}
img {
  will-change: filter;
  transition: filter 300ms;
  padding: 5px;
  width: 100%;
}
img:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
button {
  margin-top: 10px;
}
</style>
