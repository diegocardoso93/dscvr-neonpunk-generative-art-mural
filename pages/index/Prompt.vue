<script setup>
import { ref } from 'vue';
import { useData } from '../../renderer/useData';
import { getImageBase64FromUrl } from './utils';

const theme = useData()
const prompt = ref('')
const { user } = defineProps(['user'])
const message = ref()
const loading = ref()
const imgGenerated = ref()

async function send() {
  if (!prompt.value.toLocaleLowerCase().includes(theme.value.toLocaleLowerCase())) {
    message.value = `Your prompt needs to have today's theme: ${theme.value}`
    setTimeout(() => message.value = '', 5000)
    return
  }
  loading.value = true
  const response = await fetch(`/api/generate`, {
    method: 'POST',
    body: JSON.stringify({prompt: prompt.value, user: user.username}),
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
  <h2>Neonpunk Generative Art Mural</h2>
  <h4>Today's Theme: {{ theme }}</h4>
  <p>Enter your prompt to generate and pin your image to the mural :)</p>

  <div style="display: flex;margin: 10px 0;">
    <h4 class="prompt-title">prompt: </h4>
    <input v-model="prompt" id="prompt" type="text" placeholder="... your awesome prompt here">
    <button v-if="!loading" type="button" @click="send()">send</button>
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
.initial {
  padding: 10px 0 0 10px;
}
.prompt-title {
  margin: 8px 0 0 8px;
  font-size: 14px;
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
}
button:hover {
  border-color: #646cff;
}
img {
  max-width: 300px;
}
</style>

