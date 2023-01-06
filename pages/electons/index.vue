<template>
  <main class="c_election">
    <div class="c_election-header">
      <nuxt-link to="/profile">
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
    <div class="p-2 my-5">
      <AppText variant="16" font="600" class="ml-5"
        >Choice9ja Mock Election</AppText
      >
    </div>
    <div class="c_election-banner">
      <div class="flex flex-col">
        <AppText variant="16" font="600" color="white">
          Voting Ends in 6hr 30mins
        </AppText>
        <AppText class="my-1" variant="14" font="400" color="white">
          Voting Ends at 23 Aug, 2030 - 12:00am
        </AppText>
      </div>
      <button>
        <img src="/svgs/close.svg" alt="close" />
      </button>
    </div>
    <div class="c_election-list">
      <AppText variant="12" font="400" class="ml-7" color="grey">
        SELECT ELECTION
      </AppText>

      <div v-for="election in elections" v-bind:key="election.id">
        <nuxt-link :to="`${path}/${election.id}`">
          <div class="c_election-list--item">
            <div class="flex flex-col">
              <AppText variant="14" font="500">{{ election.title }}</AppText>
              <AppText class="my-2" variant="11" font="300" color="grey-2">{{
                election.description
              }}</AppText>
            </div>
            <div class="icon">
              <img src="/svgs/chevron-right.svg" alt="choice-icon" />
            </div>

            <div class="c_election-list--item-badge">
              <span>{{ election.status }}</span>
            </div>
          </div>
        </nuxt-link>
      </div>
    </div>
  </main>
</template>

<script>
import AppText from "@/reusables/Text.vue";

export default {
  name: "Elections",
  components: { AppText },
  computed: {
    path() {
      let path = this.$route.path;
      return path;
    },
    user() {
      return this.$store.state.user;
    },
  },
  data() {
    return {
      elections: [],
    };
  },
  created() {
    this.getElections();
  },
  methods: {
    async getElections() {
      try {
        await this.$axios.$get("/elections").then((response) => {
          this.elections = response.election;
        });
      } catch (error) {
        (error) => {
          this.form.isLoading = false;
          this.$toast.error(error.response.data.message);
        };
      }
    },
  },
};
</script>

<style lang="scss"></style>
