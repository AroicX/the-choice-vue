<template>
    <main class="c_home">
        <base-profile pageTitle="The House"></base-profile>
    </main>
</template>

<script>

import BaseProfile from '@/components/ratings/base-profile.vue';

export default {
    name: "HouseStateSlug",
    middleware: "index",
    components: { BaseProfile },
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

    methods: {

    },
};
</script>
