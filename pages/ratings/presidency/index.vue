<template>
    <main class="c_home">
         <spinner :loading="!candidate" />
        <base-profile v-if="candidate" pageTitle="The Presidency" :candidate="candidate" :rating="rating"></base-profile>
    </main>
</template>

<script>

import BaseProfile from '@/components/ratings/base-profile.vue';
import Spinner from '@/reusables/Spinner.vue';

export default {
    name: "PresidencyRating",
    middleware: "index",
    components: { BaseProfile, spinner: Spinner },
    computed: {
        user() {
            return this.$store.state.user;
        },
        rooms() {
            return this.$store.state.rooms;
        },
        slug() {
            let path = this.$route.params;
            return path;
        },
    },
    data() {
        return {
            isLoading: false,
            candidateType: '',
            candidate: null,
            rating: null

        };
    },
    mounted() {
        this.candidateType = this.$route.path.replace('/ratings/', '').toUpperCase();
        this.getCandidate()
    },

    methods: {
        async getCandidate() {

            await this.$axios
                .$get(`/ratings/bulk?candidate=${this.candidateType}`)
                .then((response) => {
                       const {
                        sdg
                    } = response.data[0];
                    this.candidate = response.data[0]
                    this.rating = sdg
                    // this.$store.commit("setRooms", response.room);
                })
                .catch((error) => {
                    this.$toast.error(error.response.data.message);
                });
        },
    },
};
</script>
