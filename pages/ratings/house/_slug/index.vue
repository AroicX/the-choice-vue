<template>
    <main class="c_home">
         <spinner :loading="!candidate" />
        <base-profile v-if="candidate" pageTitle="The Governors" :candidate="candidate" :rating="rating"></base-profile>
    </main>
</template>

<script>
import Spinner from '@/reusables/Spinner.vue';
import BaseProfile from '@/components/ratings/base-profile.vue';

export default {
    name: "HouseSlug",
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
                        sdg
                    } = response.data;
                    this.candidate = response.data
                    this.rating = sdg
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
