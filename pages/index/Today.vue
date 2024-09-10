<script setup>
import { onMounted, ref } from 'vue'
import { useData } from '../../renderer/useData';
import { getImageBase64FromUrl } from './utils';

let imgs = ref()
const loading = ref(true)
const theme = useData()
const { user } = defineProps(['user'])
const shouldVote = ref()
const voting = ref()

onMounted(async () => {
  const response = await fetch('/api/images');
  imgs.value = await response.json()
  for (let [idx, img] of Object.entries(imgs.value)) {
    imgs.value[idx].src = await getImageBase64FromUrl(img)
  }
  shouldVote.value = !imgs.value.some(img => img.likes.includes(user))
  loading.value = false
})

async function vote(url) {
  voting.value = true
  const response = await fetch(`/api/like`, {
    method: 'POST',
    body: JSON.stringify({url, user: user.username}),
    headers: {'Content-Type': 'application/json'}
  })
  const json = await response.json();
  console.log(json)
  if (json.ok) {
    shouldVote.value = false
  }
  voting.value = false
}
</script>

<template>
  <h2>Neonpunk Generative Art Mural</h2>
  <h4>Today's Theme: {{theme}}</h4>

  <div style="display: flex; flex-wrap: wrap;justify-content: center;padding-left: 10px;">
    <div class="img-container" v-for="img in imgs">
      <img :src="img.src" />
      <button v-if="!loading && shouldVote && !voting" @click="vote(img.url)">vote ♡</button>
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
  border-radius: 8px;
  border: 1px solid #444;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
  color: rgba(255, 255, 255, 0.87);
  position: relative;
}
button:hover {
  border-color: #646cff;
}
</style>

