<template>
  <div id="app">
    <Home />
  </div>
</template>

<script>
import Home from "@/views/home/index";
export default {
  name: "App",
  components: {
    Home,
  },
};
</script>

<style lang="scss">
body {
  margin: 0;
}
#app {
  width: 100vw;
  height: 100vh;
}
</style>
