<template>
  <v-container>
    <v-layout text-xs-center wrap id="scores-list">
      <v-flex mb-4>
        {{getScores()}}
        <v-layout justify-center v-for="score in scores" :key="score.ID">
          <h1>{{score.UserID}} -- {{ score.Score}}</h1>
        </v-layout>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  name: "scoresList",
  data: function () {
    return {
      scores: [],
    };
  },
  methods: {
    getScores: function () {
      if ((this.scores.length === 0)) {
        axios
          .get("http://127.0.0.1:6543/snake/score")
          .then((response) => {
            this.scores = response.data;
            this.scores=this.scores.sort(function (a, b) {
              return b.Score - a.Score;
            });
          })
          .catch((error) => {
            /*eslint-disable*/
            console.error(error);
            /*eslint-enable*/
          });
      }
    },
  },
};
</script>