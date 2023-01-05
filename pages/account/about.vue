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
        <AppText variant="16" font="300" hex="#282828" lineHeight="21px"
          >Lorem ipsum dolor sit amet, consectetur adipiscing elit. Leo tellus
          neque sit metus, amet tristique. Vestibulum facilisis nunc amet
          sagittis, magna sit dui mi. Quis malesuada a, amet faucibus. Auctor
          risus, sagittis tellus arcu quam ultrices viverra. Dignissim purus
          fames lacus fermentum urna eu, id penatibus egestas. Sed bibendum
          cursus nibh condimentum consectetur lorem nunc tortor. Enim est
          tincidunt eget ullamcorper tristique. Sit neque porta non purus massa
          ac. Tellus vitae, tristique imperdiet enim sed tempor. Ullamcorper ut
          nulla pharetra, amet egestas. Et ultrices diam et dui, viverra
          vulputate risus. Gravida vitae vulputate luctus curabitur vulputate
          elementum. Turpis bibendum enim ut adipiscing. Viverra cras adipiscing
          urna maecenas convallis aenean lectus. Neque egestas quis orci,
          faucibus etiam id. Ultrices integer vitae non quam sem purus nulla.
          Nam tortor mus pulvinar feugiat nibh elementum ipsum tincidunt eget.
          Suspendisse aliquet eget consequat, habitant quisque.</AppText
        >
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
