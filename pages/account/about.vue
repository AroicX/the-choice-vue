<template>
  <div class="c_setting-security">
    <div class="c_setting-header">
      <button @click.prevent="to">
        <img class="my-auto" src="/svgs/back.svg" alt="back" />
      </button>
      <nuxt-link to="/home">
        <AppText variant="16" font="500">About Chioce9ja </AppText>
      </nuxt-link>
      <div></div>
      <div></div>
    </div>

    <div class="c_setting-security_content">
      <AppText variant="28" font="600" hex="#454F54">About</AppText>
      <div class="my-5">
        <AppText variant="16" font="300" hex="#282828" lineHeight="21px">
          A platform that allows you rate politicians based
          on credible information and track record, thereby spotlighting the true choice of the people without political
          bias. Through the use of well verified facts, Choice9ja is a clear indicator of shifts in political preferences
          and can serve as a check and balancing platform during voting exercises.
          Users can create opinion polls, anonymously or publicly, for any political representative, economical issues and
          so on. Other users will then be able to vote such that the leaderboard indicates the feelings of the public. In
          essence, when a rep is falling short of expectations, the polls will reflect the performance based on user
          rating.
          Choice9ja is completely independent of government intervention. The platform requires your phone number to then
          cross verify your name with telecom operator's data and uses location-based data to detect a user's
          constituency. Profiles can also be synced with Google to control individual misuse.</AppText>
      </div>
    </div>
  </div>
</template>

<script>
import AppText from "@/reusables/Text.vue";

export default {
  name: "account-about",
  components: { AppText },
  computed: {
    path() {
      let path = this.$route.path;
      return path;
    },
  },
  methods: {
    changeTab(tab) {
      this.activeTab = tab;
    },
    to() {
      this.$router.go(-1);
    },
  },
};
</script>

<style></style>
