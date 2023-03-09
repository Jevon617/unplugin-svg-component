<script>
export default {
  name: 'App',
  data() {
    return {
    }
  },
}
</script>

<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <MySvgIcon name="vue" />
    <MySvgIcon name="icon-card2" />
    <MySvgIcon name="icon-barCode" />
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
