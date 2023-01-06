<template>
  <main class="c_discussion">
    <div class="c_discussion-header">
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
    <div class="p-2 my-5">
      <AppText varaint="16" font="600">Discourse Forums</AppText>
    </div>
    <div class="c_discussion-list">
      <nuxt-link
        :to="`${path}/${discourse.id}`"
        v-for="(discourse, key) in discussions"
        v-bind:key="key"
      >
        <div class="c_discussion-list--item">
          <div class="flex">
            <div class="icon"></div>
            <AppText class="my-auto mx-2" variant="14" font="500">{{
              discourse.topic
            }}</AppText>
          </div>
          <img class="ml-5" src="/svgs/chevron-right.svg" alt="choice-icon" />
        </div>
      </nuxt-link>
    </div>

    <div class="p-2 my-5">
      <AppText varaint="16" font="600">Polls</AppText>
    </div>
    <poll
      v-for="poll in polls"
      v-bind:key="poll.id"
      :discussion="{}"
      :poll="poll"
    />
  </main>
</template>

<script>
import AppText from "@/reusables/Text.vue";
import Poll from "@/components/poll/index.vue";

export default {
  name: "Discussions",
  components: { AppText, poll: Poll },
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
      discussions: [],
      polls: [],
    };
  },
  created() {
    this.getDiscussions();
    this.getPolls();
    // console.log(getHash("hello world"));
  },
  methods: {
    async getDiscussions() {
      // this.$store.dispatch("discussions/getDiscussions");

      try {
        await this.$axios.$get("/discussions").then((response) => {
          this.discussions = response.data;
          // console.log(response);
        });
      } catch (error) {
        (error) => {
          this.form.isLoading = false;
          this.$toast.error(error.response.data.message);
        };
      }
    },
    async getPolls() {
      // this.$store.dispatch("discussions/getDiscussions");

      try {
        await this.$axios.$get("/polls").then((response) => {
          this.polls = response.poll;
          // console.log(response);
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
