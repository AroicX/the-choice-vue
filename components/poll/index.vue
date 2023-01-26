<template>
  <div class="c_pollcontainer">
    <div class="c_poll">
      <!-- <div class="c_poll-image"> -->
      <img
        class="c_poll-image"
        src="https://res.cloudinary.com/dxakg8zuk/image/upload/v1673016977/icon-ga0ea72f0b_1920_j2ksjy.png"
        alt="user"
      />
      <!-- </div> -->
      <div>
        <div class="c_poll-header">
          <AppText variant="12" font="600" color="black"
            >Administrator Choice9ja</AppText
          >
          <div class="my-auto mx-2">
            <AppText variant="11" font="400" color="grey">@choice9ja</AppText>
          </div>
        </div>
        <div class="my-2">
          <AppText variant="11" font="400" color="grey"
            >Poll - {{ discussion?.topic || poll?.discussions?.topic }}</AppText
          >
        </div>

        <div class="wd-75 my-2">
          <AppText variant="14" font="400" color="black" lineHeight="21px">
            {{ poll.question }}</AppText
          >
        </div>
        <!-- <hr class="divider" /> -->

        <div class="c_poll-options">
          <div
            class="c_poll-options--option"
            v-for="option in poll.options"
            v-bind:key="option.text"
            @click="selectOption(option.text)"
          >
            <img
              v-if="option.text === selectedOption"
              class="selected-banner"
              src="/svgs/selected-check.svg"
              alt="selected-check"
            />

            <img
              v-if="option.image"
              class="c_poll-options--option-image"
              :src="option.image"
              alt="user"
            />
            <div v-if="hasVoted" class="content flex flex-col">
              <div class="my-auto">
                <AppText variant="12" font="500">
                  {{ option.text }}
                </AppText>
              </div>
              <div class="c_progress">
                <div
                  class="c_progress-inner"
                  :style="{
                    width: `${(option.value * 100) / 1000}% !important`,
                  }"
                >
                  <span>{{ option.value }}%</span>
                </div>
              </div>
            </div>
            <div
              v-if="!hasVoted"
              class="content"
              :class="option.text === selectedOption ? 'content-selected' : ''"
            >
              <input type="radio" name="option" />
              <div class="my-auto">
                <AppText variant="12">
                  {{ option.text }}
                </AppText>
              </div>
            </div>
          </div>
        </div>
        <button class="vote" v-if="selectedOption" @click="vote">Vote</button>

        <!-- <div class="c_poll-bottom">
          <button>
            <img src="/svgs/thumb_up.svg" alt="thumb_up" />
            <span>15</span>
          </button>
          <button>
            <img src="/svgs/thumb_down.svg" alt="thumb_down" />
          </button>
          <button>
            <img src="/svgs/comment.svg" alt="comment" />
            <span>15</span>
          </button>
          <button>
            <img src="/svgs/reply.svg" alt="reply" />
            <span>15</span>
          </button>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script>
import AppText from "@/reusables/Text.vue";

export default {
  name: "Poll",
  components: { AppText },
  props: {
    discussion: {
      type: Object,
      default: {},
    },
    poll: {
      type: Object,
      default: {},
    },
  },
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
      hasVoted: false,
      selectedOption: null,
      value: null,
    };
  },
  methods: {
    selectOption(id) {
      if (this.hasVoted) {
        return;
      }
      if (this.selectedOption === id) {
        this.selectedOption = null;
      } else {
        this.selectedOption = id;
      }
    },
    async selectedValue() {
      const { options } = this.poll;
      const found = Object.entries(options).filter((option) => {
        return option[1].text === this.selectedOption;
      });
      return found[0][0];
    },
    async vote() {
      const value = await this.selectedValue();
      this.value = value;

      await this.$axios
        .$patch(`/polls/vote/${this.slug || this.poll.id}`, {
          value,
        })
        .then((response) => {
          // console.log(response);
          this.$toast.success(response.message);
          this.selectedOption = null;
          this.hasVoted = true;
          // response.data
        })
        .catch((error) => {
          // console.log(error.response.data.message);
          this.$toast.error(error.response.data.message);
          this.selectedOption = null;
          this.hasVoted = true;
        });
    },
  },
};
</script>

<style lang="scss"></style>
