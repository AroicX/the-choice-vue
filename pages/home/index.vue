<template>
  <main class="c_home">
    <div class="c_home-header">
      <nuxt-link to="/account/profile">
        <!-- <img class="c_post-image" src="/images/png/user.jpeg" alt="user" /> -->
        <div
          class="c_post-image"
          :style="{
            backgroundImage: `url(${user?.profilePic})`,
          }"
        />
      </nuxt-link>
      <nuxt-link to="/home">
        <img class="ml-5" src="/svgs/choice-icon.svg" alt="choice-icon" />
      </nuxt-link>
      <div></div>
      <div></div>
    </div>
    <div class="p-4 m-auto">
      <AppText variant="24" font="600"
        >Know, share & vote your <br />
        choice.
      </AppText>
      <AppText
        class="my-3"
        variant="16"
        font="300"
        color="Ngreen"
        textAlign="left"
        >Learn about your nigerian politician and discuss politics, raise issues
        and vote your choice.</AppText
      >
    </div>
    <div class="h-50 p-5 border-y-4 border-black">
      <AppText variant="16" font="600"> See What’s happening </AppText>
    </div>

    <spinner :loading="!posts.length" />

    <div class="p-3">
      <!-- <poll /> -->
      <post v-for="post in posts" v-bind:key="post.id" :data="post" />
      <!-- <post /> -->
    </div>
  </main>
</template>

<script>
import AppText from "@/reusables/Text.vue";
import Post from "@/components/post/index.vue";
import Poll from "@/components/poll/index.vue";
import Spinner from "reusables/Spinner.vue";

export default {
  name: "Home",
  components: { AppText, post: Post, poll: Poll, spinner: Spinner },
  computed: {
    user() {
      return this.$store.state.user;
    },
  },
  data() {
    return {
      posts: [],
    };
  },
  async created() {
    await this.getRoom();
    await this.getPosts();
  },
  methods: {
    async getRoom() {
      await this.$axios
        .$get(`rooms/me`)
        .then((response) => {
          this.$store.commit("setRooms", response.room);
        })
        .catch((error) => {
          this.$toast.error(error.response.data.message);
        });
    },
    async getPosts() {
      await this.$axios
        .$get("/posts")
        .then((response) => {
          this.posts = response.data;
          // console.log(response.data);
        })
        .catch((error) => {
          this.$toast.error(error.response.data.message);
        });
    },
  },
};
</script>

<style></style>
