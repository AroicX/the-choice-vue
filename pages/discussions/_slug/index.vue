<template>
  <main class="c_discussion">
    <div v-if="isMember">
      <create-post
        :modal="modal"
        :discussion="discourse"
        v-on:post="handlePost"
        v-on:closeModal="closeModal"
      ></create-post>
      <button class="c_discussion-add" @click="toggleModal">
        <img src="/svgs/plus-icon.svg" alt="plus-icon" />
      </button>
    </div>
    <div class="c_discussion-header">
      <button @click.prevent="to">
        <img class="my-auto" src="/svgs/back.svg" alt="back" />
      </button>
      <nuxt-link to="/home">
        <AppText variant="16" font="500"> {{ discourse.topic }} </AppText>
      </nuxt-link>
      <div></div>
      <div></div>
    </div>

    <div class="c_discussion-intro">
      <div class="c_discussion-intro-top">
        <div class="c_discussion-intro-top--image">
          <img
            src="https://res.cloudinary.com/aroicx/image/upload/v1709110087/d5odq9kxlzmvfgkr161i.webp"
            alt="user"
          />
        </div>
        <div class="c_discussion-intro-top--btn">
          <button class="leave" v-if="isMember" :disabled="true">Leave</button>
          <button v-if="!isMember" @click.once="joinRoom">Join+</button>
        </div>
      </div>
      <div class="c_discussion-intro-text">
        <AppText variant="20" font="600" color="white">
          {{ discourse.topic }}
        </AppText>
        <AppText class="my-3" variant="12" font="400" color="white">
          <!-- {{ discourse.question }} -->
        </AppText>
        <AppText
          variant="14"
          font="300"
          color="white"
          textAlign="left"
          lineHeight="21px"
          >This forum is used to discourse {{ discourse.topic }} in Nigeria.
        </AppText>
        <!-- <AppText class="my-3 line-clamp-1" variant="14" font="300" color="white" lineHeight="1">
            {{ discourse.description }}

        </AppText> -->
      </div>
    </div>
    <div class="c_discussion-count">
      <AppText variant="12" font="400" color="white"> 700 Members </AppText>
    </div>
    <div class="c_discussion-content">
      <tabs :tabs="tabs" :activeTab="activeTab" v-on:tab-click="changeTab">
        <template v-slot:discussions>
          <post
            v-for="post in posts"
            v-bind:key="post.id"
            :data="post"
            :truncate="true"
          />
        </template>
        <template v-slot:about>
          <about-discussion
            :description="discourse.description"
            :topic="discourse.topic"
          />
          <poll
            v-for="poll in polls"
            v-bind:key="poll.id"
            :discussion="discourse"
            :poll="poll"
          />
        </template>
      </tabs>
    </div>
  </main>
</template>

<script>
import AppText from "@/reusables/Text.vue";
import Tabs from "../../../reusables/Tabs.vue";
import Poll from "@/components/poll/index.vue";
import Post from "@/components/post/index.vue";
import CreatePost from "@/components/post/create.vue";
import AboutDiscussion from "@/components/discussions/about.vue";

export default {
  name: "Discussions-Slug",
  middleware: "index",
  components: {
    AppText,
    Tabs,
    post: Post,
    poll: Poll,
    "about-discussion": AboutDiscussion,
    "create-post": CreatePost,
  },
  data() {
    return {
      modal: false,
      isMember: false,
      discourse: [],
      polls: [],
      activeTab: "discussions",
      tabs: [
        {
          title: "Discussions",
          content: "discussions",
        },
        {
          title: "About",
          content: "about",
        },
      ],
      posts: [],
    };
  },
  computed: {
    rooms() {
      return this.$store.state.rooms;
    },
    user() {
      return this.$store.state.user;
    },
    path() {
      let path = this.$route.path;
      return path;
    },
    slug() {
      let path = this.$route.params.slug;
      return path;
    },
  },
  created() {
    this.getRoom();
    this.getDiscourse();
    this.getPosts();
  },

  methods: {
    toggleModal() {
      this.modal = !this.modal;
    },
    closeModal(value) {
      this.modal = value;
    },
    to() {
      this.$router.go(-1);
    },
    changeTab(tab) {
      this.activeTab = tab;
    },
    async handlePost(data) {
      const oldPosts = this.posts;

      this.posts = [data, ...oldPosts];
    },
    async getDiscourse() {
      await this.$axios
        .$get(`/discussions/${this.slug}`)
        .then((response) => {
          this.polls = response.data.Polls;
          delete response.data.Polls;
          this.discourse = response.data;
        })
        .catch((error) => {
          this.$toast.error(error.response.data.message);
        });
    },
    async getPosts() {
      await this.$axios
        .$get(`/posts/discussions/${this.slug}`)
        .then((response) => {
          this.posts = response.data;
        })
        .catch((error) => {
          this.$toast.error(error.response.data.message);
        });
    },
    async joinRoom() {
      await this.$axios
        .$post(`/rooms/create`, {
          userId: this.user.id,
          discussionsId: this.slug,
        })
        .then(async (response) => {
          this.isMember = true;
          this.$toast.success(response.message);
          await this.getRooms();
        })
        .catch((error) => {
          this.$toast.error(error.response.data.message);
        });
    },
    async getRooms() {
      await this.$axios
        .$get(`rooms/me`)
        .then((response) => {
          this.$store.commit("setRooms", response.room);
        })
        .catch((error) => {
          this.$toast.error(error.response.data.message);
        });
    },
    getRoom() {
      const memeber = this.rooms.filter(
        (room) => parseInt(room.discussionsId) === parseInt(this.slug)
      );

      return memeber.length >= 1
        ? (this.isMember = true)
        : (this.isMember = false);
    },
  },
};
</script>

<style lang="scss"></style>
