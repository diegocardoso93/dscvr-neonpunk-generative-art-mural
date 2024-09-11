<script setup>
import { ref } from 'vue';
import { useData } from '../../renderer/useData';
import { getImageBase64FromUrl } from './utils';

const { user } = defineProps(['user'])
const theme = useData()
const prompt = ref('')
const message = ref()
const loading = ref()
const imgGenerated = ref()

async function send() {
  if (!prompt.value.toLocaleLowerCase().includes(theme.value.toLocaleLowerCase())) {
    message.value = `Your prompt needs to have today's theme: ${theme.value}`
    setTimeout(() => message.value = '', 4000)
    return
  }
  loading.value = true
  const response = await fetch(`/api/generate`, {
    method: 'POST',
    body: JSON.stringify({prompt: prompt.value, user}),
    headers: {'Content-Type': 'application/json'}
  })
  const json = await response.json();
  message.value = json.message
  prompt.value = ''
  if (json.reg) {
    imgGenerated.value = await getImageBase64FromUrl(json.reg)
  }
  loading.value = false
}
</script>

<template>
  <h4>Today's Theme: {{ theme }}</h4>
  <p>Enter your prompt to generate and pin your image to the mural :)</p>

  <div class="prompt">
    <h4 class="prompt-title">prompt: </h4>
    <input v-model="prompt" id="prompt" type="text" placeholder="... your awesome prompt here">
    <button type="button" @click="send()" :disabled="loading">
      <span v-if="loading" class="loader xsmall"></span>
      <span v-else>send</span>
    </button>
  </div>

  <div style="color: #4f46e5">
    {{ loading && 'Loading...' || '' }}
    {{ message }}
  </div>
  <img v-if="imgGenerated" :src="imgGenerated" />
</template>

<style scoped>
input {
  width: calc(100% - 16px);
  border: 1px solid #444;
  background: #1c212e;
  border-radius: 10px;
  margin: 0 6px;
  color: white;
  padding: 10px;
}
.prompt {
  display: flex;
  margin: 10px 0;
}
.prompt-title {
  margin: 8px 0 0 8px;
  font-size: 14px;
}
img {
  max-width: 300px;
}
</style>

