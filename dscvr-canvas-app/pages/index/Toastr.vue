<script setup>
const { title, message } = defineProps(['title', 'message'])
</script>

<template>
  <div class="overlay">
    <div class="content">
      <h2>{{ title }}</h2>
      <p>{{ message }}</p>
    </div>
  </div>
</template>

<style scoped>
h2 {
  margin: 10px 0;
}
.overlay {
  background: #000000c7;
  height: 100vh;
  width: 100vw;
  padding: 50px;
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
}
.content {
  text-align: center;
  width: 600px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: #1c212e;
  margin: auto;
  padding: 20px;
}
</style>
