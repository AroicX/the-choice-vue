<template>
  <div>
    <div class="c_comment">
      <button></button>
      <div
        class="c_comment-image"
      
        @click="gotoProfile(comment.user.id)"
      ></div>
      <div>
        <div class="c_comment-header">
          <button @click="gotoProfile(comment.user.id)">
            <AppText variant="12" font="600" color="black">{{
              comment.user.firstName
            }}</AppText>
          </button>
          <div class="my-auto mx-2">
            <AppText variant="11" font="400" color="grey"
              >@{{ comment.user.username }}</AppText
            >
          </div>
        </div>
        <div class="wd-100 my-2">
          <AppText variant="14" font="400" color="black" lineHeight="21px">
            {{ comment.message }}</AppText
          >

          <div class="c_comment-bottom" v-if="comment.likes">
            <button>
              <img src="/svgs/thumb_up.svg" alt="thumb_up" />
              <span>15</span>
            </button>
            <button>
              <img src="/svgs/thumb_down.svg" alt="thumb_down" />
            </button>
            <button>
              <span>Reply</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AppText from "@/reusables/Text.vue";

export default {
  name: "AppComments",
  components: { AppText },
  props: {
    comment: {
      type: Object,
      default: {},
    },
  },
  methods: {
    gotoProfile(user) {
      this.$router.push(`/profile/${user}`);
    },
  },
};
</script>

<style></style>
