<template>
  <v-container>
    <v-layout text-xs-center wrap>
      <v-flex mb-4>
        <h1 class="display-2 font-weight-bold mb-3">{{username}} - Score: {{Score.t}}</h1>
      </v-flex>
      <v-layout justify-center v-if="downloaded">
        <div :id="containerId" v-if="downloaded" />
      </v-layout>
      <v-layout justify-center v-else>
        <h3 class="placeholder">Loading ...</h3>
      </v-layout>
    </v-layout>
    <v-layout justify-center>
      <v-btn color="green"
              v-on:click="submitForm">
              Play Again
            </v-btn>
    </v-layout>
  </v-container>
</template>
 

<script>
//import getScore from "../game/snake.js"

export default {
  name: "Game",
  props: ["username"],
  data() {
    return {
      downloaded: false,
      gameInstance: null,
      containerId: "game-container",
      Score: {t:0}
    };
  },
  async mounted() {
    const game = await import(/* webpackChunkName: "game" */ "@/game/snake");
    this.downloaded = true;
    this.$nextTick(() => {
      this.gameInstance = game.launch(this.containerId,this.username,this.Score);
    });
  },
  destroyed() {
    this.gameInstance.destroy(false);
  },
  methods: {
    submitForm() {
      //this.$router.push({ name: "play", params: { UserName: this.UserName } });
      this.$router.go();
    },
  },
};
</script>


<style lang="scss" scoped>
.placeholder {
  font-size: 2rem;
  font-family: "Courier New", Courier, monospace;
}
</style>