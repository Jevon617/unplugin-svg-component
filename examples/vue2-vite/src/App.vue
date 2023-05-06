<script>
export default {
  name: 'App',
  data() {
    return {
    }
  },
  methods: {
    handleClick() {
      console.log('click')
    },
  },
}
</script>

<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <MySvgIcon name="vue" class="test" @click="handleClick" />
    <MySvgIcon name="icon-card2" @click="handleClick" />
    <MySvgIcon name="icon-barCode" @click="handleClick" />
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
