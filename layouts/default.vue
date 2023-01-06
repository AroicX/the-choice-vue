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
          link: "/electons",
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
      window.scrollTo(0, 0);
      window.scrollY = 0;
      // console.log("route change to", to);
      // console.log("route change from", from);
    },
  },
  computed: {
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
  },
};
</script>

<style scoped></style>
