<template>
  <div id="app">
    <div v-if="$nuxt.isOffline">You are offline</div>
    <Nuxt />
    <div class="c_navigation" v-if="isAuthenticated">
      <div class="c_navigation__container">
        <div
          class="c_navigation__container__item"
          v-for="item in navItems"
          v-bind:key="item.title"
        >
          <nuxt-link :to="item.link">
            <img
              :class="
                activeLink === item.link
                  ? 'c_navigation__container__item--active'
                  : 'c_navigation__container__item--inactive'
              "
              :src="`/svgs/${item.icon}.svg`"
              alt="home"
            />
            <div v-if="item.icon === 'notifications'">
              <div class="badge" v-if="notifications">
                <span>{{ notifications }}</span>
              </div>
            </div>
            <span
              :class="
                activeLink === item.link
                  ? 'c_navigation__container__item--active-text'
                  : 'c_navigation__container__item--inactive-text'
              "
              >{{ item.title }}</span
            >
          </nuxt-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Navigation",
  data() {
    return {
      navItems: [
        {
          title: "Home",
          link: "/home",
          icon: "home",
        },
        {
          title: "Discourse",
          link: "/discussions",
          icon: "discourse",
        },
        {
          title: "Voting",
          link: "/elections",
          icon: "vote",
        },
        {
          title: "Notifications",
          link: "/notifications",
          icon: "notifications",
        },
        {
          title: "Account",
          link: "/account",
          icon: "profile",
        },
      ],
    };
  },
  watch: {
    $route() {
      // const app = document.getElementById("app");
      // app.scrollTop = 0;
      // window.scrollTo(0, 0);
      // window.scrollY = 0;
      // console.log("route change to", to);
      // console.log("route change from", from);
    },
  },
  computed: {
    notifications() {
      return this.$store.state.notifications;
    },
    rooms() {
      return this.$store.state.rooms;
    },
    isAuthenticated() {
      return this.$store.state.isAuthenticated;
    },
    activeLink() {
      let path = this.$route.path;
      return path;
    },
    user() {
      return this.$store.state.user;
    },
  },
  mounted() {
    this.isAuthenticated ? this.notificationCount() : null;
  },
  methods: {
    async notificationCount() {
      await this.$axios
        .$get(`/notifications/user/count/${this.user.id}`)
        .then((response) => {
          this.$store.commit("setNotifications", response.data);
        })
        .catch((error) => {
          this.$toast.error(error.response.data.message);
        });
    },
  },
};
</script>

<style scoped></style>
