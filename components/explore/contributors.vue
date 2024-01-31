
<template>
  <nuxt-link :to="`/profile/${link}`">
  <div class="w-full flex flex-row p-2 py-3 cursor-pointer ">
      <div class="c_post-image" :style="{
        backgroundImage: `url(${user?.profilePic})`,
      }" />
      <AppText class="m-auto mx-0" variant="14" font="600">Ahmad Sanusi</AppText>
    </div>
  </nuxt-link>
  
</template>

<script>
import AppText from '@/reusables/Text.vue';

export default {
  name: 'Contributors',
  components: { AppText },
  props: {
    link: {
      type: Number,
      default: '',
    },
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
  }

}
</script>

<style></style>