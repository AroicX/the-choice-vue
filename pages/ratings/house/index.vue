<template>
    <main class="c_home">
        <div class="c_home-header">
            <nuxt-link to="/account">
                <!-- <img class="c_post-image" src="/images/png/user.jpeg" alt="user" /> -->
                <div class="c_post-image" :style="{
                    backgroundImage: `url(${user?.profilePic})`,
                }" />
            </nuxt-link>
            <nuxt-link to="/home">
                <img class="ml-5" src="/svgs/choice-icon.svg" alt="choice-icon" />
            </nuxt-link>
            <div></div>
            <div></div>
        </div>
        <div class="p-4 m-auto">
            <AppText variant="16" font="600">The House of Reps<br />
            </AppText>
        </div>




    </main>
</template>

<script>
import AppText from "@/reusables/Text.vue";
import Post from "@/components/post/index.vue";
import Poll from "@/components/poll/index.vue";
import Spinner from "reusables/Spinner.vue";

export default {
    name: "PresidencyRating",
    middleware: "index",
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
        };
    },
    async created() {

    },

    methods: {

    },
};
</script>

<style></style>
