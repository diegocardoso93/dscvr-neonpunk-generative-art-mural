<template>
  <div class="layout">
    <slot />
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: sans-serif;
  min-width: 320px;
  background-color: #1c212e;
  color: rgba(255, 255, 255, 0.87);
  text-align: center;
  padding-bottom: 20px;
}
* {
  box-sizing: border-box;
}
a {
  text-decoration: none;
}
h4 {
  margin: 10px;
  font-size: 14px;
}
h2 {
  margin: 0;
  font-size: 18px;
}

button {
  border-radius: 8px;
  border: 1px solid #444;
  padding: 10px 20px;
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

img {
  will-change: filter;
  transition: filter 300ms;
  padding: 5px;
  width: 100%;
}
img:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.loader {
  width: 48px;
  height: 48px;
  border: 5px solid rgba(255, 255, 255, 0.87);
  border-bottom-color: #646cff;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}
.loader.small {
  width: 24px;
  height: 24px;
}
.loader.xsmall {
  border: 3px solid #FFF;
  width: 16px;
  height: 16px;
}
@keyframes rotation {
  0% {
      transform: rotate(0deg);
  }
  100% {
      transform: rotate(360deg);
  }
}
</style>

<style scoped>
.layout {
  display: flex;
  max-width: 900px;
  margin: auto;
  flex-direction: column;
  padding-right: 10px;
}
</style>
