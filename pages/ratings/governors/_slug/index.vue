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
               <AppText variant="16" font="600">The Presidency<br />
                </AppText>
            <div></div>
            <div></div>
        </div>
        <div class="p-4 m-auto">
        

            <div class="w-full flex my-3 py-3">
                <div class="my-2">
                    <img class="" src="/svgs/ratings/dummy.svg" alt="dummy" />
                </div>
                <div class="my-auto px-2">
                    <AppText class="m-auto" variant="24" font="600">Bola Ahmed Tinubu (GCFR)</AppText>
                    <div class="flex my-2">
                        <img class="my-auto " src="/svgs/ratings/party.svg" alt="party" />
                        <AppText class="mx-3 my-auto" variant="14" font="300">All Progressive Party (APC)</AppText>
                    </div>
                </div>
            </div>

            <tabs :tabs="tabs" :activeTab="activeTab" v-on:tab-click="changeTab">
                <template v-slot:performance>
                    <div class="c_performance" v-for="performance in performanceItem" v-bind:key="performance">
                        <AppText variant="16" font="600" >{{ performance }}</AppText>
                        <div class="c_performance-item" v-for="pill in pills" v-bind:key="pill.rank">
                            <img src="/svgs/ratings/mini-star.svg" alt="mini-star">
                            <span>{{ pill.rank }}</span>
                            <div class="pill float-left" :style="{ background: pill.color, width: pill.value}"></div>
                            <span class="value">889</span>
                        </div>
                    </div>
                </template>
                <template v-slot:profile>

                    <div class="c_political">
                        <AppText variant="16" font="600" color="green">Political Information</AppText>
                        <div v-for="item in political_info" v-bind:key="item.title" class="c_political-item">
                            <AppText variant="16" font="500" color="gray">{{ item.title }}</AppText>
                            <AppText variant="16" font="300" class="right text-right float-right text-wrap">{{ item.desc }}
                            </AppText>
                        </div>
                    </div>
                </template>
            </tabs>

            <nuxt-link class="submit" to="/">
                Submit Feedback
            </nuxt-link>

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
    name: "GovernorSlug",
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
            political_info: [
                {
                    title: 'Position',
                    desc: 'Presidential'
                },
                {
                    title: 'Constituency',
                    desc: 'Nigeria'
                },
                {
                    title: 'Age',
                    desc: '71'
                },
                {
                    title: 'Party',
                    desc: 'All Progressive Party'
                },
                {
                    title: 'Education',
                    desc: `SSC BACHELOR OF ENGINEERING (MECHANICAL ENGINEERING)`
                },
                {
                    title: 'Profession',
                    desc: `Accountant`
                }
            ],
            activeTab: "performance",
            tabs: [
                {
                    title: "Performance",
                    content: "performance",
                },
                {
                    title: "Profile",
                    content: "profile",
                },
            ],
            performanceItem: [
                'Education',
                'Security',
                'Agriculture',
                'Foreign Exchange',
                'Finance',
                'Infrastructure',
                'Aviation'


            ],
            pills: [
                {
                    rank: 5,
                    value: '80%',
                    color: 'rgba(46, 174, 78, 1)',
                },
                {
                    rank: 4,
                    value: '60%',
                    color: 'rgba(255, 224, 66, 1)',
                },
                {
                    rank: 3,
                    value: '50%',
                    color: 'rgba(33, 150, 243, 1)',
                },
                {
                    rank: 2,
                    value: '30%',
                    color: 'rgba(255, 165, 0, 1)',
                },
                {
                    rank: 1,
                    value: '30%',
                    color: 'rgba(225, 25, 0, 1)',
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
    },
};
</script>

<style lang="scss">
.submit{
    position: fixed;
    bottom: 5rem;
    right: 1rem;
    z-index: 1000;
    min-width: 120px;
    height: 50px;
    padding: 1rem 1.5rem;
    background: green;
    border-radius: 3rem;
    color: white;
    cursor: pointer;
}
.c_performance {
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
        display: flex;
        flex-direction: row;
        padding: 1rem 0;
        .pill{
            background: green;
            width: 80%;
            height: .4rem;
            border-radius: .5rem;
            margin: auto 0;
        }
        span{
            margin: auto .5rem;
        }

        .value{
            font-size: 12px;
            font-weight: bold;
        }

    }
}
.c_political {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 2rem;
    border-radius: 10px;
    border: 1px solid #98E4AB;
    background: #fff;
    margin: 1rem 0;

    &-item {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding: 1rem 0;
        border-bottom: 1px solid rgba(190, 190, 190, 0.363);
    }
}
</style>
