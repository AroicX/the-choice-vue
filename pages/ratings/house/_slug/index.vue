<template>
    <main class="c_home">
        <base-profile pageTitle="The Governors" :candidate="candidate" :rating="rating"></base-profile>
    </main>
</template>

<script>

import BaseProfile from '@/components/ratings/base-profile.vue';

export default {
    name: "HouseSlug",
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
            let path = this.$route.params.slug;
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

        if (!this.slug) {
            this.to();
        } else {
            this.getCandidate()
        }
    },

    methods: {
        async getCandidate() {
            await this.$axios
                .$get(`/ratings?candidate_id=${this.slug}`)
                .then((response) => {
                    const {
                        educations,
                        agriculture,
                        finance,
                        youth_empowerment,
                        foreign_exchange,
                        infrastructure,
                        aviation,
                    } = response.data;
                    this.candidate = response.data
                    this.rating = {
                        educations,
                        agriculture,
                        finance,
                        youth_empowerment,
                        foreign_exchange,
                        infrastructure,
                        aviation,
                    }
                })
                .catch((error) => {
                    this.$toast.error(error.response.data.message);
                });
        },
        to() {
            this.$router.go(-1);
        },
    },
};
</script>
