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
            <div class="w-full flex center flex-1">
                <input class="w-full px-3 py-2 border broder-b-1 rounded outline-none" type="text" placeholder="search"
                    v-model="keyword" />
            </div>
            <button @click.prevent="makeSearch" class="p-3">
                <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M26.6063 28.0836L18.3219 19.7992C17.6344 20.3951 16.8323 20.8591 15.9156 21.1914C14.999 21.5237 14.025 21.6898 12.9937 21.6898C10.5187 21.6898 8.42188 20.8305 6.70312 19.1117C4.98438 17.393 4.125 15.319 4.125 12.8898C4.125 10.4607 4.98438 8.38672 6.70312 6.66797C8.42188 4.94922 10.5073 4.08984 12.9594 4.08984C15.3885 4.08984 17.4568 4.94922 19.1641 6.66797C20.8714 8.38672 21.725 10.4607 21.725 12.8898C21.725 13.8753 21.5646 14.8263 21.2437 15.743C20.9229 16.6596 20.4417 17.519 19.8 18.3211L28.1531 26.6055C28.3594 26.7888 28.4625 27.0237 28.4625 27.3102C28.4625 27.5966 28.3479 27.8544 28.1188 28.0836C27.9125 28.2898 27.6604 28.393 27.3625 28.393C27.0646 28.393 26.8125 28.2898 26.6063 28.0836ZM12.9594 19.6273C14.8156 19.6273 16.3969 18.9685 17.7031 17.6508C19.0094 16.3331 19.6625 14.7461 19.6625 12.8898C19.6625 11.0336 19.0094 9.44661 17.7031 8.12891C16.3969 6.8112 14.8156 6.15234 12.9594 6.15234C11.0802 6.15234 9.48177 6.8112 8.16406 8.12891C6.84635 9.44661 6.1875 11.0336 6.1875 12.8898C6.1875 14.7461 6.84635 16.3331 8.16406 17.6508C9.48177 18.9685 11.0802 19.6273 12.9594 19.6273Z"
                        fill="#2eae4e" />
                </svg>
            </button>
        </div>

        <tabs :tabs="tabs" :activeTab="activeTab" v-on:tab-click="changeTab">
            <template v-slot:popular>
                <post v-for="post in posts" v-bind:key="post.id" :data="post" />
            </template>
            <template v-slot:latest>
                <post v-for="post in posts" v-bind:key="post.id" :data="post" />
            </template>
            <template v-slot:polls>
                <poll v-for="poll in polls" v-bind:key="poll.id" :discussion="{}" :poll="poll" />
            </template>
            <template v-slot:contributors>
                <Contributors v-for="user in users" :data="user" v-bind:key="user.username" :link="user.id" />
            </template>
        </tabs>
    </main>
</template>

<script>
import AppText from '@/reusables/Text.vue'
import Post from '@/components/post/index.vue'
import Poll from '@/components/poll/index.vue'
import Contributors from '@/components/explore/contributors.vue'
import Spinner from 'reusables/Spinner.vue'
import Tabs from 'reusables/Tabs.vue'

export default {
    name: 'ExplorePage',
    middleware: 'index',
    components: {
        AppText,
        post: Post,
        poll: Poll,
        spinner: Spinner,
        Tabs,
        Contributors,
    },
    computed: {
        user() {
            return this.$store.state.user
        },
        rooms() {
            return this.$store.state.rooms
        },
        searchValue() {
            return this.$store.state.search
        },
    },
    data() {
        return {
            isLoading: false,
            posts: [],
            featured_elections: [],
            tabs: [
                {
                    title: 'Popular',
                    content: 'popular',
                },
                {
                    title: 'Latest',
                    content: 'latest',
                },
                {
                    title: 'Polls',
                    content: 'polls',
                },
                {
                    title: 'Contributors',
                    content: 'contributors',
                },
            ],
            activeTab: 'popular',
            keyword: '',
            users: [],
        }
    },
    watch: {
        keyword: async function (val) {
            // console.log(val);
            // await this.getSearch(val);
        },
    },
    mounted() {
        this.keyword = this.searchValue.keyword
        this.posts = this.searchValue.posts
        this.users = this.searchValue.users
    },
    destroy() {
        this.$destroy();
        this.$store.commit('setSearch', { keyword: "", posts: [], users: [] })
    },
    methods: {
        makeSearch() {
            if (this.keyword === '') return
            // if (this.activeTab === 'popular' || this.activeTab === 'latest') {
                this.getSearch(this.keyword)
            // } else if (this.activeTab === 'contributors') {
                this.getSearchForUser(this.keyword)
            // }
        },
        changeTab(tab) {
            this.activeTab = tab
        },
        to() {
            this.$router.go(-1)
        },
        async getSearch(value) {
            //   value.replace("#", "")
            await this.$axios
                .$get(`/posts/search?keyword=${value.replace('#', '')}`)
                .then((response) => {
                    this.$store.commit('setSearch', {
                        keyword: value.replace('#', ''),
                        posts: response.data,
                        users: this.users,
                    })
                    this.posts = response.data
                })
                .catch((error) => {
                    this.$toast.error(error.response.data.message)
                })
        },
        async getSearchForUser(value) {
            //   value.replace("#", "")
            await this.$axios
                .$get(`users/search?search=${value.replace('#', '')}`)
                .then((response) => {
                    this.$store.commit('setSearch', {
                        keyword: value.replace('#', ''),
                        posts: this.posts,
                        users: response.data,
                    })

                    this.users = response.data
                })
                .catch((error) => {
                    this.$toast.error(error.response.data.message)
                })
        },
        async getRoom() {
            await this.$axios
                .$get(`rooms/me`)
                .then((response) => {
                    this.$store.commit('setRooms', response.room)
                })
                .catch((error) => {
                    this.$toast.error(error.response.data.message)
                })
        },
        async getBanner() {
            await this.$axios
                .$get(`elections/banner`)
                .then((response) => {
                    this.featured_elections = response.election
                    // console.log(response.election);
                    // this.$store.commit("setRooms", response.room);
                })
                .catch((error) => {
                    this.$toast.error(error.response.data.message)
                })
        },
        async getPosts() {
            this.isLoading = true
            await this.$axios
                .$get(`/posts`)
                .then((response) => {
                    this.isLoading = false
                    this.posts = response.data
                })
                .catch((error) => {
                    this.$toast.error(error.response.data.message)
                })
        },
        async getPolls() {
            try {
                await this.$axios.$get('/polls').then((response) => {
                    this.polls = response.poll
                    // console.log(response);
                })
            } catch (error) {
                ; (error) => {
                    this.$toast.error(error.response.data.message)
                }
            }
        },
    },
}
</script>

<style></style>
