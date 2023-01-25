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

    <div class="h-50 p-5 border-y-4 border-black" v-if="featured_elections">
      <AppText variant="16" font="600"> Choice Mock Election </AppText>
    </div>
    <div class="c_slider" v-if="featured_elections">
      <div class="c_slider-slides">
        <div
          class="c_slider-item"
          v-for="(election, key) in featured_elections"
          v-bind:key="election.id"
          :style="{
            background: key + 1 === 1 ? '#2EAE4E' : '#F2FCF5',
          }"
        >
          <nuxt-link :to="`/elections/${election.id}`">
            <div class="c_slider-item--content">
              <span
                class="badge"
                :class="
                  election.status.includes('Ongoing')
                    ? 'badge--on'
                    : 'badge--off'
                "
                >{{ election.status }}</span
              >
              <img
                :src="`/svgs/${key + 1 === 1 ? 'groupW' : 'groupG'}.svg`"
                :alt="election.title"
              />
              <div class="mt-10">
                <AppText
                  class="my-3"
                  variant="16"
                  font="400"
                  :color="key + 1 === 1 ? 'white' : 'black'"
                >
                  {{ election.title }}</AppText
                >
                <AppText
                  class="my-3"
                  variant="16"
                  font="300"
                  :color="key + 1 === 1 ? 'white' : 'black'"
                >
                  {{ election.description }}</AppText
                >
              </div>
            </div>
          </nuxt-link>
        </div>
      </div>
    </div>
    <!--  -->

    <!--  -->

    <div class="h-50 p-5 border-y-4 border-black">
      <AppText variant="16" font="600"> See What’s happening </AppText>
    </div>

    <spinner :loading="!posts" />

    <div class="p-3" v-if="posts">
      <!-- <poll /> -->
      <post v-for="post in posts" v-bind:key="post.id" :data="post" />
      <!-- <post /> -->
    </div>

    <div
      class="flex center align-middle p-5 bg-green-500 m-5 rounded-md"
      v-if="posts?.length <= 0"
    >
      <span class="font-bold text-white">No post found</span>
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
    rooms() {
      return this.$store.state.rooms;
    },
  },
  data() {
    return {
      isLoading: false,
      posts: null,
      featured_elections: [],
      slider: [
        {
          id: 1,
          title: "Presidential Election",
          description: "Join 20,000+ others to vote your desired candidate.",
          icon: "groupW",
          status: "Ongoing Election",
          bg: "#2EAE4E",
          color: "white",
        },
        {
          id: 2,
          title: "Senatorial Election ",
          description: "Join 20,000+ others to vote your desired candidate.",
          icon: "groupG",
          status: "Upcoming Election",
          bg: "#F2FCF5",
          color: "black",
        },
        {
          id: 3,
          title: "Senatorial Election ",
          description: "Join 20,000+ others to vote your desired candidate.",
          icon: "groupG",
          status: "Upcoming Election",
          bg: "#F2FCF5",
          color: "black",
        },
      ],
      pagination: {
        skip: 0,
        take: 50,
      },
    };
  },
  async created() {
    this.rooms.length < 1 ? await this.getRoom() : null;
    await this.getBanner();
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
    async getBanner() {
      await this.$axios
        .$get(`elections/banner`)
        .then((response) => {
          this.featured_elections = response.election;
          // console.log(response.election);
          // this.$store.commit("setRooms", response.room);
        })
        .catch((error) => {
          this.$toast.error(error.response.data.message);
        });
    },
    async getPosts() {
      this.isLoading = true;
      await this.$axios
        .$get("/posts")
        .then((response) => {
          this.isLoading = false;
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
