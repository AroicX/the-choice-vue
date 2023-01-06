<template>
  <main>
    <modal :active="modal" v-on:closeModal="closeModal"> </modal>
    <div class="c_election">
      <div class="c_election-header">
        <button @click.prevent="to">
          <img class="my-auto" src="/svgs/back.svg" alt="back" />
        </button>
        <nuxt-link to="/home">
          <AppText variant="16" font="500"> {{ election.title }} </AppText>
        </nuxt-link>
        <div></div>
        <div></div>
      </div>
      <div class="c_election-map">
        <img src="/images/png/map.png" alt="map" />
      </div>
      <div class="my-5 px-2">
        <AppText class="uppercase" variant="14" font="300" hex="#B2B6B8">
          Canditates</AppText
        >
      </div>
      <div class="c_election-content">
        <div
          class="c_election-content--item"
          v-for="option in election.options"
          v-bind:key="option.id"
        >
          <div class="flex gap-5">
            <div
              class="c_election-content--item-image"
              :style="{
                backgroundImage: `url(${option.image})`,
              }"
            ></div>
            <!-- <img :src="option.image" alt="user" /> -->
            <div class="c_election-content--item-info">
              <AppText variant="16" font="500"> {{ option.text }} </AppText>
              <AppText v-if="hasVoted" variant="14" font="400">
                {{ option.value }}
              </AppText>
              <button v-if="!hasVoted" @click="vote(option)">Vote</button>
            </div>
          </div>
          <div class="c_election-content--item-action">
            <button>
              <img src="/svgs/chevron-right.svg" alt="choice-icon" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import AppText from "@/reusables/Text.vue";
import Modal from "@/reusables/Modal.vue";

export default {
  name: "SingleElection",
  components: { AppText, modal: Modal },
  computed: {
    rooms() {
      return this.$store.state.rooms;
    },
    user() {
      return this.$store.state.user;
    },
    path() {
      let path = this.$route.path;
      return path;
    },
    slug() {
      let path = this.$route.params.slug;
      return path;
    },
  },
  data() {
    return {
      election: [],
      modal: false,
      value: null,
      hasVoted: false,
    };
  },
  created() {
    console.log(this.$el);
    this.getElection();
  },
  methods: {
    toggleModal() {
      this.modal = !this.modal;
    },
    closeModal(value) {
      this.modal = value;
    },
    to() {
      this.$router.go(-1);
    },
    async getElection() {
      try {
        await this.$axios.$get(`/elections/${this.slug}`).then((response) => {
          this.election = response.election;
        });
      } catch (error) {
        (error) => {
          this.form.isLoading = false;
          this.$toast.error(error.response.data.message);
        };
      }
    },
    async selectedValue(data) {
      const { options } = this.election;
      const found = Object.entries(options).filter((option) => {
        return option[1].text === data.text;
      });
      return found[0][0];
    },
    async vote(option) {
      const value = await this.selectedValue(option);
      this.value = value;
      // this.toggleModal();
      // return true;

      await this.$axios
        .$patch(`/elections/vote/${this.slug}`, {
          value,
        })
        .then((response) => {
          this.$toast.success(response.message);
          this.selectedOption = null;
          this.hasVoted = true;
          // response.data
        })
        .catch((error) => {
          this.$toast.error(error.response.data.message);
          this.selectedOption = null;
          this.hasVoted = true;
        });
    },
  },
};
</script>

<style></style>
