<template>
  <div class="c_setting-security">
    <div class="c_setting-header">
      <button @click.prevent="to">
        <img class="my-auto" src="/svgs/back.svg" alt="back" />
      </button>
      <nuxt-link to="/home">
        <AppText variant="16" font="500">Report a problem </AppText>
      </nuxt-link>
      <div></div>
      <div></div>
    </div>

    <div class="c_setting-security_content">
      <AppText variant="28" font="600" hex="#454F54">Report a problem</AppText>
      <div class="my-5">
        <AppText class="uppercase" variant="12" font="300" hex="#B2B6B8"
          >Select an option</AppText
        >
      </div>
      <div
        class="c_setting-security_content-option"
        v-for="option in options"
        v-bind:key="option.sub"
      >
        <input
          class="c_input-radio"
          type="radio"
          name="option"
          v-model="selected"
        />
        <div class="flex flex-col my-auto ml-5">
          <AppText variant="16" font="500" hex="#454F54">{{
            option.title
          }}</AppText>
          <AppText class="my-1" variant="12" font="300" hex="#B2B6B8">{{
            option.text
          }}</AppText>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AppText from "@/reusables/Text.vue";

export default {
  name: "account-report",
  components: { AppText },
  data() {
    return {
      selected: null,
      options: [
        {
          title: "Bugs",
          sub: "bugs",
          text: "Malfunction, Glitch, User Inferface",
        },
        {
          title: "Spam",
          sub: "spam",
          text: "Pushing illegal mandates, money scams etc.",
        },
        {
          title: "Hate Speech",
          sub: "hate_speech",
          text: "Serious attack on a group or poeple",
        },
        {
          title: "Harrasment or Bullying",
          sub: "harrasment",
          text: "Harrassing or threatening an individual",
        },
        {
          title: "Plagiarism ",
          sub: "plagiarism",
          text: "No attribution to original owner",
        },
        {
          title: "Terms and Policies",
          sub: "terms",
          text: "Our polices and rules",
        },
        {
          title: "Other",
          sub: "other",
          text: "Other reasons",
        },
      ],
    };
  },
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
