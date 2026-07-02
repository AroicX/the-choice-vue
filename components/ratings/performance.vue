<template>
   <div>
     <div class="c_performance" v-for="(performance,key) in rating" v-bind:key="key">
            <AppText variant="16" font="600">{{ key.toLocaleUpperCase().replace(/_/g, ' ') }}</AppText>
            <div class="c_performance-item" v-for="pill in performance" v-bind:key="pill.rank">
                <img src="/svgs/ratings/mini-star.svg" alt="mini-star">
                <span>{{ pill.rank }}</span>
                <div class="pill float-left" :style="{ background: pill.color, width: pill.value }"></div>
                <span class="value">{{pill.votes}}</span>
            </div>
        </div>
   </div>
</template>

<script>
import AppText from "@/reusables/Text.vue";


export default {
    name: "PerformanceRating",
    middleware: "index",
    components: { AppText },
    props: {
        rating: {
            type: Object,
            default () {
                return {}
            }
        },
        performance: {
            type: Array,
            default () {
                return {}
            }
        }
    },
    data() {
        return {
            isLoading: false,    
            performanceItem: this.performance,
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
                    value: '20%',
                    color: 'rgba(225, 25, 0, 1)',
                },
            ]
        };
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
