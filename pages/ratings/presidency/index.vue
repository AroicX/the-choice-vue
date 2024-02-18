<template>
    <main class="c_home">
        <base-profile pageTitle="The Presidency" :candidate="candidate" :rating="rating"></base-profile>
    </main>
</template>

<script>

import BaseProfile from '@/components/ratings/base-profile.vue';

export default {
    name: "PresidencyRating",
    middleware: "index",
    components: { BaseProfile },
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
                        educations,
                        agriculture,
                        finance,
                        youth_empowerment,
                        foreign_exchange,
                        infrastructure,
                        aviation,
                    } = response.data[0];
                    this.candidate = response.data[0]
                    this.rating = {
                        educations,
                        agriculture,
                        finance,
                        youth_empowerment,
                        foreign_exchange,
                        infrastructure,
                        aviation,
                    }
                    // this.$store.commit("setRooms", response.room);
                })
                .catch((error) => {
                    this.$toast.error(error.response.data.message);
                });
        },
    },
};
</script>
