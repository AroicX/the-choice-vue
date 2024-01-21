<template>
    <main class="c_home">
        <div class="c_home-header">
            <nuxt-link to="/account">
                <!-- <img class="c_post-image" src="/images/png/user.jpeg" alt="user" /> -->
                <div class="c_post-image" :style="{
                    backgroundImage: `url(${user?.profilePic})`,
                }" />
            </nuxt-link>
            <div class="w-full flex center flex-1">
                <input class="w-full px-3 py-2 border broder-b-1 rounded outline-none" type="text" placeholder="search">
            </div>
        </div>
        <div class="p-4 m-auto my-2">
            <AppText variant="16" font="600">Trending</AppText>
            </div>


           <div class="flex flex-col gap-1">
            <nuxt-link :to="`/explore/${n}`" v-for="n in 20" v-bind:key="n" class="w-full flex p-4">
                 <div class="flex flex-col">
                        <AppText variant="11" font="300">Presidency</AppText>
                        <AppText class="mt-3 my-1" variant="16" font="600">Peter Obidatti</AppText>
                        <AppText variant="11" font="300">26.3K Discussions</AppText>
                    </div>
            </nuxt-link>
           </div>

    </main>
</template>

<script>
import AppText from "@/reusables/Text.vue";
import Post from "@/components/post/index.vue";
import Poll from "@/components/poll/index.vue";
import Spinner from "reusables/Spinner.vue";

export default {
    name: "ExplorePage",
    components: { AppText, post: Post, poll: Poll, spinner: Spinner },
    computed: {
        user() {
            return this.$store.state.user;
        },
        rooms() {
            return this.$store.state.rooms;
        },
    },
    data() {
        return {
            isLoading: false,
            posts: null,
            featured_elections: [],
           
        };
    },
    async created() {
        
    },

    methods: {
        async getRoom() {
            await this.$axios
                .$get(`rooms/me`)
                .then((response) => {
                    this.$store.commit("setRooms", response.room);
                })
                .catch((error) => {
                    this.$toast.error(error.response.data.message);
                });
        },
        async getBanner() {
            await this.$axios
                .$get(`elections/banner`)
                .then((response) => {
                    this.featured_elections = response.election;
                    // console.log(response.election);
                    // this.$store.commit("setRooms", response.room);
                })
                .catch((error) => {
                    this.$toast.error(error.response.data.message);
                });
        },
        async getPosts() {
            this.isLoading = true;
            await this.$axios
                .$get(`/posts`)
                .then((response) => {
                    this.isLoading = false;
                    this.posts = response.data;
                })
                .catch((error) => {
                    this.$toast.error(error.response.data.message);
                });
        },
    },
};
</script>

<style></style>
