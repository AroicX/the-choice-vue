<template>
  <div class="c_setting-security">
    <div class="c_setting-header">
      <button @click.prevent="to">
        <img class="my-auto" src="/svgs/back.svg" alt="back" />
      </button>
      <nuxt-link to="/home">
        <AppText variant="16" font="500">Security </AppText>
      </nuxt-link>
      <div></div>
      <div></div>
    </div>

    <div class="c_setting-security_content">
      <AppText variant="28" font="600" hex="#454F54">Security</AppText>
      <div class="my-5">
        <AppText variant="12" font="300" hex="#B2B6B8"
          >VERIFIED INFORMATION</AppText
        >
      </div>
      <div class="c_setting-security_content--item">
        <AppText variant="16" font="600" hex="#454F54">FullName</AppText>
        <AppText class="my-2" variant="14" font="300" hex="#626A6E">{{
          user.firstName + " " + user.lastName
        }}</AppText>
      </div>
      <div class="c_setting-security_content--item">
        <AppText variant="16" font="600" hex="#454F54">Username</AppText>
        <AppText class="my-2" variant="14" font="300" hex="#626A6E">{{
          user.username
        }}</AppText>
      </div>
      <div class="c_setting-security_content--item">
        <AppText variant="16" font="600" hex="#454F54">Email Address</AppText>
        <AppText class="my-2" variant="14" font="300" hex="#626A6E">{{
          user.email
        }}</AppText>
      </div>
      <div class="c_setting-security_content--item">
        <AppText variant="16" font="600" hex="#454F54">Phone Number </AppText>
        <AppText class="my-2" variant="14" font="300" hex="#626A6E">{{
          user.phoneNo
        }}</AppText>
      </div>
      <div class="c_setting-security_content--item">
        <AppText variant="16" font="600" hex="#454F54"
          >ID - National Identification Number (NIN)</AppText
        >
        <AppText class="my-2" variant="14" font="300" hex="#626A6E">-</AppText>
      </div>
    </div>
    <br />

    <div class="c_setting-security_content">
      <div class="my-5">
        <AppText variant="12" font="300" hex="#B2B6B8">PASSWORD</AppText>
      </div>

      <nuxt-link :to="`${path}/password`">
        <div class="c_discussion-list--item">
          <div class="flex">
            <img class="my-auto" src="/svgs/lock-icon.svg" alt="lock-icon" />

            <AppText class="my-auto mx-2" variant="14" font="500" hex="#626A6E"
              >Change Password</AppText
            >
          </div>
          <img class="ml-5" src="/svgs/chevron-right.svg" alt="choice-icon" />
        </div>
      </nuxt-link>
    </div>
  </div>
</template>

<script>
import AppText from "@/reusables/Text.vue";

export default {
  name: "account-security",
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
