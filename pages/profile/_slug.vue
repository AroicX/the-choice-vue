<template>
  <main class="c_setting">
    <div class="c_setting-header">
      <button @click.prevent="to">
        <img class="my-auto" src="/svgs/back.svg" alt="back" />
      </button>
      <nuxt-link to="/home">
        <AppText variant="16" font="500" v-if="user"
          >{{ user ? user.username + "'s" : "" }} Profile
        </AppText>
      </nuxt-link>
      <div></div>
      <div></div>
    </div>

    <spinner :loading="!user" />

    <div v-if="user">
      <div class="c_setting-profile no-border no-shadow">
        <div
          class="c_setting-profile-image"
          :style="{
            backgroundImage: `url(${user.profilePic})`,
          }"
        />

        <div class="my-auto mx-3">
          <div class="flex">
            <AppText variant="22" font="600">{{
              user ? user.firstName + " " + user.lastName : ""
            }}</AppText>
            <img
              v-if="user.verifiedPhoneNo"
              class="my-auto ml-2"
              src="/svgs/verifed-icon.svg"
              alt="verifed-icon"
            />
          </div>

          <n-link :to="`${path}/profile`">
            <div
              class="w-auto flex my-1 bg-gray-200 p-1 justify-center rounded-full"
            >
              <AppText class="my-1" variant="12" font="300" color="grey"
                >Star Citizen</AppText
              >
            </div>
          </n-link>
        </div>
      </div>
      <div class="px-5 py-3">
        <AppText
          class="my-1"
          variant="14"
          font="300"
          color="grey"
          lineHeight="21px"
        >
          {{ user?.about }}
        </AppText>
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
    </div>
  </main>
</template>

<script>
import AppText from "@/reusables/Text.vue";
import Tabs from "@/reusables/Tabs.vue";
import Button from "@/reusables/Button.vue";
import Post from "@/components/post/index.vue";
import AboutDiscussion from "@/components/discussions/about.vue";
import Spinner from "reusables/Spinner.vue";

export default {
  name: "account-profile",
  components: {
    AppText,
    Tabs,
    post: Post,
    Button,
    "about-discussion": AboutDiscussion,
    spinner: Spinner,
  },
  data() {
    return {
      user: null,
      posts: [],
      activeTab: "posts",
      tabs: [
        {
          title: "Posts",
          content: "posts",
        },
        // {
        //   title: "Discussions",
        //   content: "discussions",
        // },
      ],
    };
  },
  computed: {
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
        .$get(`/users/profile/${this.slug}`)
        .then((response) => {
          this.posts = response.data.posts;
          // delete response.data.posts;
          this.user = response.data;
        })
        .catch((error) => {
          this.$toast.error(error.response.data.message);
        });
    },
  },
};
</script>

<style lang="scss"></style>
