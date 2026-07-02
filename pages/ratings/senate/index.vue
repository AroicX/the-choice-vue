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
            <nuxt-link to="/home">
                <img class="ml-5" src="/svgs/choice-icon.svg" alt="choice-icon" />
            </nuxt-link>
            <div></div>
            <div></div>
        </div>
        <div class="p-4 m-auto">
            <AppText variant="16" font="600">The Senate<br />
            </AppText>
        </div>

        <div class="p-4">
            <div class="searchBox">
                <img class="m-auto" src="/svgs/ratings/search.svg" alt="search" />
                <input class="" type="text" placeholder="Search by  state or party...">
            </div>

            <!-- <span class="my-2">36 Governors *</span> -->

            <nuxt-link v-for="candidate in candidates" v-bind:key="candidate.candidateId"
                :to="`/ratings/senate/${candidate.candidateId}`" class="w-full flex my-3 py-3 line">
                <div class="my-2">
                    <img width="60px" :src="candidate?.image" alt="dummy" />
                </div>
                <div class="flex-1 my-auto px-2">
                    <AppText class="m-auto" variant="16" font="600">{{ candidate.name }}</AppText>
                    <div class="flex fl flex-col my-1">
                        <AppText class="my-1" variant="14" font="300">{{ candidate.party.name }} ({{ candidate.party.slug }})
                        </AppText>
                        <AppText class="my-1" variant="12" font="300" color="blue">{{ candidate.constituency }} State
                        </AppText>
                    </div>
                </div>
                <div class="m-auto"><svg width="142" height="24" viewBox="0 0 142 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <mask id="mask0_3719_14548" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="117" y="0"
                            width="25" height="24">
                            <rect x="117.5" width="24" height="24" fill="#D9D9D9" />
                        </mask>
                        <g mask="url(#mask0_3719_14548)">
                            <path d="M126.9 18L125.5 16.6L130.1 12L125.5 7.4L126.9 6L132.9 12L126.9 18Z" fill="#809191" />
                        </g>
                    </svg>
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
    name: "SenatePage",
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
            candidates: [],

        };
    },
    mounted() {
        this.getCandidates()
    },

    methods: {
        to() {
            this.$router.go(-1);
        },
        async getCandidates() {
            await this.$axios
                .$get(`/ratings/bulk?candidate=SENATOR`)
                .then((response) => {
                    this.candidates = response.data
                })
                .catch((error) => {
                    this.$toast.error(error.response.data.message);
                });
        },
    },



};
</script>

<style lang="scss">
.searchBox {
    /* background: rgb(236, 236, 236); */
    width: 100%;
    height: auto;
    display: flex;
    border-radius: .5rem;
    overflow: hidden;
    border: 1px solid rgba(118, 118, 118, 0.336);

    img {
        padding: 0 1rem;
    }

    input {
        /* background: rgb(228, 228, 228); */
        flex: 1;
        padding: 1rem 1.5rem;
        outline: none;
    }
}

.line {
    border-bottom: 1px solid rgba(190, 190, 190, 0.363);
}</style>
