<template>
  <v-container>
    <v-layout text-xs-center wrap>
      <v-flex mb-4>
        <h1 class="display-2 font-weight-bold mb-3">Olsg98 - Score: 10</h1>
      </v-flex>
      <v-layout justify-center v-if="downloaded">
        <div :id="containerId" v-if="downloaded" />
      </v-layout>
      <v-layout justify-center v-else>
        <h3 class="placeholder">Loading ...</h3>
      </v-layout>
    </v-layout>
    <v-layout justify-center>
      <v-btn color="green">
        <a href="/play" class="nav-link">Play Again</a>
      </v-btn>
    </v-layout>
  </v-container>
</template>
 

<script>
export default {
  name: "Game",
  data() {
    return {
      downloaded: false,
      gameInstance: null,
      containerId: "game-container",
    };
  },
  async mounted() {
    const game = await import(/* webpackChunkName: "game" */ "@/game/snake");
    this.downloaded = true;
    this.$nextTick(() => {
      this.gameInstance = game.launch(this.containerId);
    });
  },
  destroyed() {
    this.gameInstance.destroy(false);
  },
};
</script>


<style lang="scss" scoped>
.placeholder {
  font-size: 2rem;
  font-family: "Courier New", Courier, monospace;
}
</style>