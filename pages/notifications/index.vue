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

    <spinner :loading="isLoading" />

    <div class="c_notification-list relative" v-if="notifications">
      <div
        class="c_notification-list--item relative"
        v-for="(item, key) in notifications"
        v-bind:key="item.id"
        :class="item.isRead ? 'read' : 'unread'"
      >
        <div class="c_notification-list--item-user relative">
          <img class="icon" :src="resolveIcon(item?.data)" alt="like" />
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
            v-if="item?.data?.discussionsId"
            @click="$router.push(`/discussions/${item?.data?.discussionsId}`)"
          >
            View Room
          </button>
          <button
            class="c_notification-list--item-message-btn"
            v-if="item?.data?.commentId"
            @click="$router.push(`/threads/post/${item?.data?.postId}`)"
          >
            View Post
          </button>
        </div>

        <div class="date">
          <AppText
            class="uppercase"
            variant="10"
            color="Ngreen"
            font="500"
            textAlign="right"
            >{{ new Date(item.createdAt).toDateString() }}
          </AppText>
        </div>
        <button
          v-if="!item.isRead"
          class="mark-as-read"
          @click="read(item.id, key)"
        >
          Mark as read
        </button>
      </div>
    </div>

    <div
      class="flex center align-middle p-5 bg-green-500 m-5 rounded-md"
      v-if="notifications?.length <= 0"
    >
      <span class="font-bold text-white">No notifications found</span>
    </div>
  </div>
</template>

<script>
import AppText from "@/reusables/Text.vue";
import { time_ago } from "@/utils/index";
import { throws } from "assert";
import Spinner from "reusables/Spinner.vue";

export default {
  name: "Notification",
  components: { AppText, spinner: Spinner },
  computed: {
    user() {
      return this.$store.state.user;
    },
    notificationsCount() {
      return this.$store.state.notifications;
    },
  },
  data() {
    return {
      isLoading: false,
      notifications: null,
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
      } else {
        return "/svgs/noti/share.svg";
      }
    },

    async getNotifications() {
      this.isLoading = true;
      await this.$axios
        .$get(`/notifications/user/${this.user.id}`)
        .then((response) => {
          this.isLoading = false;
          this.notifications = response.data;
        })
        .catch((error) => {
          this.$toast.error(error.response.data.message);
        });
    },
    async read(id, key) {
      await this.$axios
        .$patch(`/notifications/${id}`)
        .then((response) => {
          this.notifications[key].isRead = true;

          this.$store.commit(
            "setNotifications",
            parseInt(this.notificationsCount) - 1
          );
        })
        .catch((error) => {
          this.$toast.error(error.response.data.message);
        });
    },
  },
};
</script>

<style lang="scss">
.mark-as-read {
  position: absolute;
  /* top: -; */
  /* bottom: rem; */
  right: 0;
  background: #2ecc71 !important;
  color: #fff;
  min-width: 100px;
  font-size: 12px;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 3rem;
}
</style>
