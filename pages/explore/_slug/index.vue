<template>
    <main class="c_home">
        <div class="c_home-header">
            <button @click.prevent="to">
                <!-- <img class="c_post-image" src="/images/png/user.jpeg" alt="user" /> -->
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M21.0626 29.7059L14.2825 22.9258C14.1798 22.823 14.1068 22.7117 14.0637 22.5919C14.0212 22.472 14 22.3436 14 22.2067C14 22.0697 14.0212 21.9413 14.0637 21.8214C14.1068 21.7016 14.1798 21.5903 14.2825 21.4876L21.0626 14.7075C21.2509 14.5191 21.4862 14.4205 21.7683 14.4116C22.0512 14.4034 22.2953 14.502 22.5008 14.7075C22.7063 14.8958 22.8134 15.1311 22.8223 15.4132C22.8306 15.6961 22.7319 15.9402 22.5265 16.1457L17.4928 21.1794H28.9727C29.2638 21.1794 29.5079 21.2777 29.7052 21.4742C29.9017 21.6714 30 21.9156 30 22.2067C30 22.4977 29.9017 22.7415 29.7052 22.9381C29.5079 23.1353 29.2638 23.2339 28.9727 23.2339H17.4928L22.5265 28.2677C22.7148 28.456 22.8134 28.6957 22.8223 28.9868C22.8306 29.2778 22.7319 29.5175 22.5265 29.7059C22.3381 29.9113 22.0984 30.014 21.8074 30.014C21.5163 30.014 21.2681 29.9113 21.0626 29.7059Z"
                        fill="#1C1B1F" />
                </svg>

            </button>
            <div class="w-full flex center flex-1">
                <input class="w-full px-3 py-2 border broder-b-1 rounded outline-none" type="text" placeholder="search">
            </div>
        </div>

        <!-- <div class="w-full flex flex-row justify-between p-4 ">
            <button v-for="tab in tabs" v-bind:key="tab" class="p-2 flex flex-1 transition-all duration-300"
                :class="activeTab === tab ? 'border-b-4 border-green-500' : 'border-faint'"
                @click.prevent="activeTab = tab"
            >
                <AppText
                variant="14"
                :font="activeTab === tab ? '600' : '300'"
                 
                >{{ tab }}</AppText>
            </button>
        </div> -->

        <tabs :tabs="tabs" :activeTab="activeTab" v-on:tab-click="changeTab">
            <template v-slot:popular>
                <post v-for="post in posts" v-bind:key="post.id" :data="post" />
            </template>
            <template v-slot:latest>
                    <post v-for="post in posts" v-bind:key="post.id" :data="post" />

            </template>
            <template v-slot:polls>
      <poll v-for="poll in polls" v-bind:key="poll.id" :discussion="{}" :poll="poll" />
            </template>
            <template v-slot:contributors>
                <h1>Contributors</h1>
            </template>
        </tabs>






    </main>
</template>

<script>
import AppText from "@/reusables/Text.vue";
import Post from "@/components/post/index.vue";
import Poll from "@/components/poll/index.vue";
import Spinner from "reusables/Spinner.vue";
import Tabs from "reusables/Tabs.vue";


export default {
    name: "ExploreSlug",
    middleware: 'index',
    components: { AppText, post: Post, poll: Poll, spinner: Spinner, Tabs, },
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
            tabs: [
                {
                    title: "Popular",
                    content: "popular",
                },
                {
                    title: "Latest",
                    content: "latest",
                },
                {
                    title: "Polls",
                    content: "polls",
                },
                {
                    title: "Contributors",
                    content: "contributors",
                },
            ],
            activeTab: "popular"

        };
    },
    async created() {
        await this.getPosts();
        await this.getPolls();
    },

    methods: {
        changeTab(tab) {
            this.activeTab = tab;
        },
        to() {
            this.$router.go(-1);
        },
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
         async getPolls() {

            try {
                await this.$axios.$get("/polls").then((response) => {
                    this.polls = response.poll;
                    // console.log(response);
                });
            } catch (error) {
                (error) => {
                    this.$toast.error(error.response.data.message);
                };
            }
        },
    },
};
</script>

<style></style>
