<template>
  <div class="c_notification">
    <div class="c_discussion-header">
      <nuxt-link to="/account/profile">
        <!-- <img class="c_post-image" src="/images/png/user.jpeg" alt="user" /> -->
        <div
          class="c_post-image"
          :style="{
            backgroundImage: `url(${user?.profilePic})`,
          }"
        />
      </nuxt-link>
      <nuxt-link to="/home">
        <img class="ml-5" src="/svgs/choice-icon.svg" alt="choice-icon" />
      </nuxt-link>
      <div></div>
      <div></div>
    </div>

    <div class="p-2 my-5">
      <AppText varaint="16" font="600">Notifications</AppText>
    </div>

    <div class="c_notification-list">
      <div
        class="c_notification-list--item"
        v-for="item in notifications"
        v-bind:key="item.id"
        :class="item.isRead ? 'read' : 'unread'"
      >
        <div class="c_notification-list--item-user">
          <img class="icon" :src="resolveIcon(item.data)" alt="like" />
          <div
            class="c_post-image"
            :style="{
              backgroundImage: `url(${user?.profilePic})`,
            }"
          />
        </div>
        <div class="c_notification-list--item-message">
          <AppText class="my-auto mx-2" variant="14" font="400"
            >{{ item.message }}
          </AppText>
          <button
            class="c_notification-list--item-message-btn"
            v-if="item.data.discussionsId"
            @click="$router.push(`/discussions/${item.data.discussionsId}`)"
          >
            View Room
          </button>
          <button
            class="c_notification-list--item-message-btn"
            v-if="item.data.commentId"
            @click="$router.push(`/threads/post/${item.data.postId}`)"
          >
            View Post
          </button>
        </div>

        <div>
          <!-- <button>
            <img class="icon" src="/svgs/more.svg" alt="more" />
          </button> -->
          <AppText
            class="uppercase"
            variant="10"
            color="Ngreen"
            font="400"
            textAlign="right"
            >{{ time_ago(item.createdAt) }}
          </AppText>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AppText from "@/reusables/Text.vue";
import { time_ago } from "@/utils/index";

export default {
  name: "Notification",
  components: { AppText },
  computed: {
    user() {
      return this.$store.state.user;
    },
  },
  data() {
    return {
      notifications: [],
    };
  },
  created() {
    this.getNotifications();
  },
  methods: {
    time_ago,
    to() {
      this.$router.go(-1);
    },
    resolveIcon(data) {
      if (data?.commentId) {
        return "/svgs/noti/comment.svg";
      } else if (data?.discussionsId) {
        return "/svgs/noti/room.svg";
      }
    },

    async getNotifications() {
      await this.$axios
        .$get(`/notifications/user/${this.user.id}`)
        .then((response) => {
          this.notifications = response.data;
        })
        .catch((error) => {
          this.$toast.error(error.response.data.message);
        });
    },
  },
};
</script>

<style lang="scss"></style>
