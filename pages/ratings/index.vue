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
        <!-- <div class="p-4 m-auto">
            <AppText variant="16" font="600">Know your leaders <br />
                choice.
            </AppText>
            <AppText class="my-3" variant="16" font="300" color="Ngreen" textAlign="left">See how your leaders are
                performing in various areas of concern.
            </AppText>
        </div> -->

        <div class="c_ratings">
            <div>
                 <AppText variant="16" font="600">Know your leaders <br />
                        choice.
                    </AppText>
                    <AppText class="my-3" variant="16" font="300" color="Ngreen" textAlign="left">See how your leaders are
                        performing in various areas of concern.
                    </AppText>
            </div>
            
            <nuxt-link class="c_ratings_card" v-for="item in list" v-bind:key="item.title" v-bind:to="item.link">
                <div class="p-2 flex border-y-4 border-black" v-if="item.images">
                    <img class="img" v-for="image in item.images" v-bind:key="image" :src="image" alt="">
                    <div class="count" v-if="item.count">
                        <span>{{ item.count }}</span>
                    </div>
                </div>

                <div class="p-2 border-y-4 border-black">
                    <p>{{ item.title }}</p>
                </div>
                <div class="p-2 border-y-4 border-black">
                    <span>{{ item.description }}</span>
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
    name: "Ratings",
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
            list: [
                {
                    title: "The Presidency",
                    description: "H.E. Bola Ahmed Tinubu GCFR, is the 16th and current President of the Federal Republic of Nigeria.",
                    images: ["/images/png/president.png"],
                    link: "/ratings/presidency"
                },
                {
                    title: "The Governors",
                    description: "A list of the 36 state governors highlighting their achievements and performance in various sectors.",
                    images: ["/images/png/peter.png", "/images/png/can.png", "/images/png/can-1.png", "/images/png/can-2.png"],
                    count: 32,
                    link: "/ratings/governors"
                },
                {
                    title: "The Senate",
                    description: "A list of the 109 senators highlighting their achievements and performance in their respective constituency.",
                    images: ["/images/png/peter.png", "/images/png/can.png", "/images/png/can-1.png", "/images/png/can-2.png"],
                    count: 105,
                    link: "/ratings/senate"
                },
                {
                    title: "The House",
                    description: "A list of the 360 members of the House, highlighting their achievements and performance in their respective constituency.",
                    images: ["/images/png/peter.png", "/images/png/can.png", "/images/png/can-1.png", "/images/png/can-2.png"],
                    count: 365,
                    link: "/ratings/house"
                },
            ]

        };
    },
    async created() {

    },

    methods: {

    },
};
</script>

<style></style>
