<template>
  <main class="c_setting">
    <div class="c_setting-header">
      <button @click.prevent="to">
        <img class="my-auto" src="/svgs/back.svg" alt="back" />
      </button>
      <nuxt-link to="/home">
        <AppText variant="16" font="500"
          >{{ user.username + "'s" }} Profile
        </AppText>
      </nuxt-link>
      <div></div>
      <div></div>
    </div>

    <div class="c_setting-profile no-border no-shadow">
      <div
        class="c_setting-profile-image"
        :style="{
          backgroundImage: `url(${user.profilePic})`,
        }"
      ></div>

      <div class="my-auto mx-3">
        <div class="flex">
          <AppText variant="22" font="600">{{
            user.firstName + " " + user.lastName
          }}</AppText>
          <img
            v-if="user.verifiedPhoneNo"
            class="my-auto ml-2"
            src="/svgs/verifed-icon.svg"
            alt="verifed-icon"
          />
        </div>

        <div
          class="w-auto flex my-1 bg-gray-200 p-1 justify-center rounded-full"
        >
          <AppText class="my-1" variant="12" font="300" color="grey"
            >Star Citizen</AppText
          >
        </div>
      </div>
    </div>
    <div class="p-5 bg-white">
      <AppText variant="14" font="400" color="grey-2">{{
        user?.about
      }}</AppText>
      <Button
        width="100%"
        height="40px"
        variant="transparent"
        borderRadius="3rem"
        class="font-bold"
        @click="$router.push('/account/profile/edit-profile')"
        >Edit Profile</Button
      >
    </div>

    <div class="c_setting-content">
      <tabs :tabs="tabs" :activeTab="activeTab" v-on:tab-click="changeTab">
        <template v-slot:discussions>
          <about-discussion />
        </template>
        <template v-slot:posts>
          <post
            v-for="post in posts"
            v-bind:key="post.id"
            :showComments="false"
            :data="post"
          />
        </template>
      </tabs>
    </div>
  </main>
</template>

<script>
import AppText from "@/reusables/Text.vue";
import Tabs from "@/reusables/Tabs.vue";
import Button from "@/reusables/Button.vue";
import Post from "@/components/post/index.vue";
import AboutDiscussion from "@/components/discussions/about.vue";

export default {
  name: "account-profile",
  components: {
    AppText,
    Tabs,
    post: Post,
    Button,
    "about-discussion": AboutDiscussion,
  },
  data() {
    return {
      posts: [],
      activeTab: "posts",
      tabs: [
        {
          title: "Posts",
          content: "posts",
        },
        {
          title: "Discussions",
          content: "discussions",
        },
      ],
    };
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
    path() {
      let path = this.$route.path;
      return path;
    },
  },
  created() {
    this.getPosts();
  },
  methods: {
    changeTab(tab) {
      this.activeTab = tab;
    },
    to() {
      this.$router.go(-1);
    },
    async getPosts() {
      await this.$axios
        .$get(`/posts/user/${this.user.id}`)
        .then((response) => {
          // console.log(response);
          this.posts = response.data;
        })
        .catch((error) => {
          this.$toast.error(error.response.data.message);
        });
    },
  },
};
</script>

<style lang="scss"></style>
