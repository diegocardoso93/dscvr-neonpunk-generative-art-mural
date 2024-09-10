<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { CanvasClient } from '@dscvr-one/canvas-client-sdk'
import Prompt from './Prompt.vue';
import Today from './Today.vue';
import Previous from './Previous.vue';

const selected = ref(0)
const canvasClient = ref()
const user = ref()

async function start() {
  canvasClient.value = new CanvasClient()
  if (!canvasClient.value) return
  const response = await canvasClient.value.ready()
  if (response) {
    user.value = response.untrusted.user
  }
}

onMounted(async () => {
  await start()
})

onUnmounted(() => {
  if (canvasClient.value) {
    canvasClient.value.destroy()
  }
})
</script>

<template>
  <div class="navigation">
    <a class="navitem" @click="selected = 0">Today</a>
    <a class="navitem" @click="selected = 1">Prompt</a>
    <a class="navitem" @click="selected = 2">Previous</a>
  </div>
  <div class="content">
    <Today v-if="selected == 0" :user="user"/>
    <Prompt v-else-if="selected == 1" :user="user"/>
    <Previous v-else-if="selected == 2" :user="user" :canvasClient="canvasClient"/>
  </div>
</template>

<style scoped>
.content {
  padding-top: 16px;
}
.navigation {
  padding: 10px 0 0 10px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.8em;
  flex-direction: row;
  justify-content: space-between;
}
.navitem {
  padding: 3px;
  font-weight: bold;
  font-weight: 700;
  font-size: 12px;
  text-decoration: none;
  background: #464053;
  color: #908fad;
  padding: 4px 6px 0 6px;
  cursor: pointer;
}
.navitem:visited {
  text-transform: none;
  color: #908fad;
}
</style>
