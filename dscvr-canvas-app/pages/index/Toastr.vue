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
.overlay {
  background: rgba(0, 0, 0, 0.3);
  height: calc(100vh - 100px);
  width: calc(100vw - 100px);
  padding: 50px;
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
}
.content {
  text-align: center;
  width: 600px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
  margin: auto;
  padding-bottom: 10px;
}
</style>
