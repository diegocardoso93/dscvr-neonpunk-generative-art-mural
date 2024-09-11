<script setup>
import { onMounted, ref } from 'vue'
import { useData } from '../../renderer/useData';
import { getImageBase64FromUrl } from './utils';
import { Toastr } from './Toastr'

const { user } = defineProps(['user'])
const theme = useData()
let imgs = ref()
const loading = ref(true)
const shouldVote = ref()
const voting = ref()
const showLikeFeedback = ref()

onMounted(async () => {
  const response = await fetch('/api/images');
  imgs.value = await response.json()
  for (let [idx, img] of Object.entries(imgs.value)) {
    imgs.value[idx].src = await getImageBase64FromUrl(img)
  }
  shouldVote.value = !imgs.value.some(img => img.likes.includes(user))
  loading.value = false
})

async function vote(url, index) {
  voting.value = index
  const response = await fetch(`/api/like`, {
    method: 'POST',
    body: JSON.stringify({url, user}),
    headers: {'Content-Type': 'application/json'}
  })
  const json = await response.json();
  console.log(json)
  if (json.ok) {
    shouldVote.value = false
    showLikeFeedback.value = true
    setTimeout(() => {
      showLikeFeedback.value = false
    }, 5000)
  }
  voting.value = false
}
</script>

<template>
  <h4>Today's Theme: {{theme}}</h4>

  <div class="wrapper">
    <div v-for="(img, index) in imgs" class="img-container">
      <img :src="img.src" />
      <button v-if="!loading && shouldVote" @click="vote(img.url, index)" :disabled="voting">
        <span v-if="voting" class="loader xsmall"></span>
        <span v-else>vote ♡</span>
      </button>
    </div>
  </div>
  <p v-if="loading">Loading...</p>
  <p v-else-if="!imgs.length">Nothing to show yet...</p>

  <Toastr 
    v-if="showLikeFeedback"
    title="Thank you!! 🎉🎊"
    message="Be sure to come back tomorrow and check the 'Previous' tab to see if you voted for the winner and to redeem your NFT! ♡"
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
</style>
