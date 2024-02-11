
<template>
  <nuxt-link :to="`/profile/${link}`">
  <div class="w-full flex flex-row p-2 py-3 cursor-pointer ">
      <div class="c_post-image" :style="{
        backgroundImage: `url(${data?.profilePic})`,
      }" />
     <div class="flex flex-col">
       <AppText class="m-auto mx-0" variant="12" font="400">@{{ data?.username }}</AppText>
       <AppText class="m-auto mx-0" variant="16" font="600">{{ data?.firstName+' '+data?.lastName }}</AppText>
     </div>
    </div>
  </nuxt-link>
  
</template>

<script>
import AppText from '@/reusables/Text.vue';

export default {
  name: 'Contributors',
  components: { AppText },
  props: {
    data: {
      type: Object,
      default: '',
    },
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