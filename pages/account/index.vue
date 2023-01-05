<template>
  <main class="c_setting">
    <div class="c_setting-header">
      <nuxt-link to="/account/profile">
        <img class="c_post-image" src="/images/png/user.jpeg" alt="user" />
      </nuxt-link>
      <nuxt-link to="/home">
        <img class="ml-5" src="/svgs/choice-icon.svg" alt="choice-icon" />
      </nuxt-link>
      <div></div>
      <div></div>
    </div>
    <div class="c_setting-profile">
      <img
        class="c_setting-profile-image"
        src="/images/png/user.jpeg"
        alt="user"
      />

      <div class="my-auto mx-3">
        <AppText variant="16" font="600">{{
          user.firstName + " " + user.lastName
        }}</AppText>
        <n-link :to="`${path}/profile`">
          <AppText class="my-1" variant="12" font="400" color="grey"
            >View your Profile</AppText
          >
        </n-link>
      </div>
    </div>
    <div class="c_setting-list">
      <div v-for="item in itemLinks" v-bind:key="item.id">
        <nuxt-link :to="`${path}/${item.link}`">
          <div class="c_setting-list--item">
            <div class="flex">
              <img :src="`/svgs/setting/${item.icon}.svg`" :alt="item.name" />
              <AppText
                class="my-auto ml-5"
                variant="14"
                font="300"
                color="grey-2"
                >{{ item.name }}</AppText
              >
            </div>
            <img class="ml-5" src="/svgs/chevron-right.svg" alt="choice-icon" />
          </div>
        </nuxt-link>
      </div>
    </div>

    <br />
    <button class="c_setting-list" @click.once="logout">
      <div class="c_setting-list--item">
        <div class="flex">
          <img :src="`/svgs/setting/logout.svg`" alt="logout" />
          <AppText class="my-auto ml-5" variant="14" font="300" color="grey-2"
            >Logout</AppText
          >
        </div>
        <img class="ml-5" src="/svgs/chevron-right.svg" alt="choice-icon" />
      </div>
    </button>
  </main>
</template>

<script>
import AppText from "@/reusables/Text.vue";

export default {
  name: "Profile",
  components: { AppText },
  computed: {
    user() {
      return this.$store.state.user;
    },
    path() {
      let path = this.$route.path;
      return path;
    },
  },
  data() {
    return {
      itemLinks: [
        {
          id: 1,
          name: "Security",
          link: "security",
          icon: "security",
        },
        { id: 2, name: "About App", link: "about", icon: "about" },
        {
          id: 3,
          name: "Terms & Conditions",
          link: "term_condition",
          icon: "t_c",
        },
        {
          id: 4,
          name: "Report a problem",
          link: "report",
          icon: "report",
        },
      ],
    };
  },
  methods: {
    logout() {
      this.$store.dispatch("logout");
      this.$router.push("/auth/login");
    },
  },
};
</script>

<style lang="scss"></style>
