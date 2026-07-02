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

    <spinner :loading="isLoading" />

    <div class="c_discussion-list" v-if="discussions">
      <nuxt-link
        :to="`${path}/${discourse.id}`"
        v-for="(discourse, key) in discussions"
        v-bind:key="key"
      >
        <div class="c_discussion-list--item">
          <div class="flex">
            <div class="icon"></div>
            <div class="flex flex-1 flex-col my-auto">
              <AppText class="mx-2" variant="11" font="500" color="blue"
                >{{ discourse.topic }}
              </AppText>
              <AppText class="my-1 mx-2" variant="14" font="500"
                >{{ discourse.topic }}
                <span class="active_joined" v-if="isJoined(discourse.id)"
                  >Joined</span
                >
              </AppText>
              <AppText class="my-1 mx-2 line-clamp-1" variant="11" font="400">
                {{ discourse.description }}
              </AppText>
            </div>
          </div>
          <img class="ml-5" src="/svgs/chevron-right.svg" alt="choice-icon" />
        </div>
      </nuxt-link>
    </div>
    <div
      class="flex center align-middle p-5 bg-green-500 m-5 rounded-md"
      v-if="discussions?.length <= 0"
    >
      <span class="font-bold text-white">No discussions found</span>
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
    <div
      class="flex center align-middle p-5 bg-green-500 m-5 rounded-md"
      v-if="polls?.length <= 0"
    >
      <span class="font-bold text-white">No polls found</span>
    </div>
  </main>
</template>

<script>
import AppText from "@/reusables/Text.vue";
import Poll from "@/components/poll/index.vue";
import Spinner from "reusables/Spinner.vue";

export default {
  name: "Discussions",
  middleware: "index",
  components: { AppText, poll: Poll, spinner: Spinner },
  computed: {
    path() {
      let path = this.$route.path;
      return path;
    },
    user() {
      return this.$store.state.user;
    },
    rooms() {
      return this.$store.state.rooms;
    },
  },
  data() {
    return {
      discussions: null,
      polls: [],
      isLoading: false,
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
      this.isLoading = true;
      try {
        await this.$axios.$get("/discussions").then((response) => {
          this.isLoading = false;
          this.discussions = response.data;

          // console.log(response);
        });
      } catch (error) {
        (error) => {
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
          this.$toast.error(error.response.data.message);
        };
      }
    },
    isJoined(id) {
      return this.rooms.filter((room) => {
        if (room.discussionsId === id) {
          return true;
        }
      })[0];
    },
  },
};
</script>

<style lang="scss"></style>
