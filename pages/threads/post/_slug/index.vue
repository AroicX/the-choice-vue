<template>
  <main class="c_discussion">
    <div class="c_discussion-header">
      <button @click.prevent="to">
        <img class="my-auto" src="/svgs/back.svg" alt="back" />
      </button>
      <nuxt-link to="/home">
        <AppText variant="16" font="500"> Thread</AppText>
      </nuxt-link>
      <div></div>
      <div></div>
    </div>
    <div class="c_discussion-content">
      <post :data="storePost" />
    </div>
  </main>
</template>

<script>
import AppText from "@/reusables/Text.vue";
import Tabs from "@/reusables/Tabs.vue";
import Post from "@/components/post/index.vue";

export default {
  name: "Single-Post",
  components: {
    AppText,
    Tabs,
    post: Post,
  },
  data() {
    return {
      modal: false,
      isMember: false,
    };
  },
  computed: {
    storePost() {
      return this.$store.state.singlePost;
    },
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
    // console.log("created", this.storePost);
  },
  destroyed() {
    this.$store.commit("setSinglePost", {});
  },
  methods: {
    to() {
      this.$router.go(-1);
    },

    async getDiscourse() {
      await this.$axios
        .$get(`/discussions/${this.slug}`)
        .then((response) => {
          this.discourse = response.data;
          this.poll = response.data.Polls;
        })
        .catch((error) => {
          this.$toast.error(error.response.data.message);
        });
    },
  },
};
</script>

<style lang="scss"></style>
