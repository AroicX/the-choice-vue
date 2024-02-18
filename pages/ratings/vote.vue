<template>
    <main class="c_home">
        <div class="c_home-header">
            <button @click.prevent="to">
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M21.0626 29.7059L14.2825 22.9258C14.1798 22.823 14.1068 22.7117 14.0637 22.5919C14.0212 22.472 14 22.3436 14 22.2067C14 22.0697 14.0212 21.9413 14.0637 21.8214C14.1068 21.7016 14.1798 21.5903 14.2825 21.4876L21.0626 14.7075C21.2509 14.5191 21.4862 14.4205 21.7683 14.4116C22.0512 14.4034 22.2953 14.502 22.5008 14.7075C22.7063 14.8958 22.8134 15.1311 22.8223 15.4132C22.8306 15.6961 22.7319 15.9402 22.5265 16.1457L17.4928 21.1794H28.9727C29.2638 21.1794 29.5079 21.2777 29.7052 21.4742C29.9017 21.6714 30 21.9156 30 22.2067C30 22.4977 29.9017 22.7415 29.7052 22.9381C29.5079 23.1353 29.2638 23.2339 28.9727 23.2339H17.4928L22.5265 28.2677C22.7148 28.456 22.8134 28.6957 22.8223 28.9868C22.8306 29.2778 22.7319 29.5175 22.5265 29.7059C22.3381 29.9113 22.0984 30.014 21.8074 30.014C21.5163 30.014 21.2681 29.9113 21.0626 29.7059Z"
                        fill="#1C1B1F" />
                </svg>
            </button>
            <nuxt-link to="">
                <AppText variant="16" font="400">Submit Feedback </AppText>

            </nuxt-link>
            <div></div>
            <div></div>
        </div>
        <div class="p-4 m-auto">
            <AppText variant="16" font="300">Provide feedback to your leaders regarding their performance in various areas
                of concern. </AppText>

            <div class="c_ratings" v-for="(performance,index) in performanceItem" v-bind:key="performance.title">
              <div class="flex justify-between">  <AppText variant="16" font="600">{{ performance.title }} </AppText> <AppText class="my-auto" variant="12" font="600">Rating: {{ performance.rating + 1 }}</AppText></div>
                <div class="flex justify-between" @mousedown="selected = index">
                    <div class="c_ratings-item" v-for="(rate,star_idx) in ratings" v-bind:key="star_idx" @mouseover="handleRating(performance, index, star_idx)">
                        <img v-if="star_idx <= performance.rating" class="mx-auto" width="50px" :src="colored" alt="colored">
                        <img  v-if="star_idx > performance.rating" class="mx-auto" width="50px" :src="uncolored" alt="uncolored">
                        <span>{{ rate.text }}</span>
                    </div>
                </div>
            </div>

            <button class="submit-btn" @click="submit">
                Submit Feedback
            </button>

        </div>




    </main>
</template>

<script>
import AppText from "@/reusables/Text.vue";
import Tabs from "reusables/Tabs.vue";
import Post from "@/components/post/index.vue";
import Poll from "@/components/poll/index.vue";
import Spinner from "reusables/Spinner.vue";

export default {
    name: "RatingVote",
    middleware: "index",
    components: { AppText, post: Post, Tabs, poll: Poll, spinner: Spinner },
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
            performanceItem: [
                {title: 'Education', rating: 0},
                { title: 'Security', rating: 0 },
               { title: 'Agriculture', rating: 0},
                {title:'Foreign Exchange', rating: 0},
                {title:'Finance', rating: 0},
                {title: 'Infrastructure', rating: 0},
               {title: 'Aviation', rating: 0}
            ],
            colored: '/svgs/ratings/coloredStar.svg',
            uncolored: '/svgs/ratings/uncoloredStar.svg',
            selected: 0,
            ratings: [

                {
                    level: 1,
                    text: 'Very Bad'
                },
                {
                    level: 2,
                    text: 'Bad'
                },
                {
                    level: 3,
                    text: 'Fair'
                },
                {
                    level: 4,
                    text: 'Good'
                },
                {
                    level: 5,
                    text: 'Very Good'
                },
            ]
        };
    },
    async created() {

    },

    methods: {
        changeTab(tab) {
            this.activeTab = tab;
        },
        to() {
            this.$router.go(-1);
        },
        handleRating(data, index, star_idx) {
        this.performanceItem[index].rating = star_idx
        },
        submit() {
            
        }
    },
};
</script>

<style lang="scss">
.submit-btn {
    /* position: fixed; */
    /* bottom: 5rem; */
    /* right: 1rem; */
    /* z-index: 1000; */
    width: 100%;
    height: 50px;
    padding: 1rem 1.5rem;
    background: green;
    border-radius: 3rem;
    color: white;
    cursor: pointer;
}

.c_ratings {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 2rem;
    border-radius: 10px;
    border: 1px solid rgba(190, 190, 190, 0.363);
    background: #fff;
    margin: 1rem 0;

    &-item {
        /* background: red; */
        display: flex;
        flex-direction: column;
        padding: 1rem 0;

        .pill {
            background: green;
            width: 80%;
            height: .4rem;
            border-radius: .5rem;
            margin: auto 0;
        }

        span {
            font-size: 12px;
            margin: .5rem auto;
        }

        .value {
            font-size: 12px;
            font-weight: bold;
        }

    }
}
</style>
