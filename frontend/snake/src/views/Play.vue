<template>
  <Game :username="username"/>
</template>


<script>
import Game from '@/components/Game.vue'
export default {
  name: 'play',
  components: { Game },
  props: ["username"]
}
</script>


<style lang="scss">
body {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
}
</style>