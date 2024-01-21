<template>
  <div>
    <create-comment :modal="modal" :postId="data.id" :comments="data.comments" v-on:newComment="handleComment"
      v-on:closeModal="closeModal" />

    <div class="c_postcontainer">
      <div class="c_post" :id="`post-${data.id}`">
        <!-- <div class="c_post-image"> -->
        <div class="c_post-image" :style="{
          backgroundImage: `url(${data.user?.profilePic})`,
        }" @click="gotoProfile(data.user?.id)"></div>
        <!-- </div> -->
        <div class="wd-100">
          <button class="c_post-header" @click="gotoProfile(data.user.id)">
            <AppText variant="12" font="600" color="black">{{
              fullname
            }}</AppText>
            <div class="my-auto mx-2">
              <AppText variant="11" font="400" color="grey">@{{ username }}</AppText>
            </div>
          </button>
          <AppText class="my-2 uppercase" variant="11" font="400" color="black2">Discussion - {{ data.discussions.topic }}
          </AppText>
          <div class="wd-100 my-2">
            <button @click.once="gotoPost">
              <AppText variant="14" font="400" color="black" textAlign="left" lineHeight="21px">
                {{ data.message }}</AppText>
            </button>

            <div class="c_post-bottom" v-if="isMember">
              <button :id="`post_like-${data.id}`" @click.prevent="like(`post_like-${data.id}`)">
                <img src="/svgs/thumb_up.svg" alt="thumb_up" />
                <span>{{ kFormatter(data.likes) }}</span>
              </button>
              <button :id="`post_dislike-${data.id}`" @click.prevent="dislike(`post_dislike-${data.id}`)">
                <img src="/svgs/thumb_down.svg" width="20px" height="20px" alt="thumb_down" />
              </button>
              <button :id="`post_comment-${data?.id}`" @click="addComment(`post_comment-${data?.id}`)">
                <img src="/svgs/comment.svg" alt="comment" />
                <span>{{ kFormatter(data?._count?.comments) }}</span>
              </button>
              <button :id="`post_share-${data?.id}`">
                <img src="/svgs/reply.svg" alt="reply" />
                <!-- <span>{{ kFormatter(data?.dislikes) }}</span> -->
              </button>
            </div>
          </div>
          <!-- <hr class="divider" /> -->
        </div>
      </div>
      <div v-if="showComments">
        <!-- <AppText class="ml-16" variant="10">Comments</AppText> -->
        <AppComments v-for="comment in comments" v-bind:key="comment.id" :comment="comment" />
      </div>
    </div>
    <hr class="divider" />
  </div>
</template>

<script>
import AppText from "@/reusables/Text.vue";
import CreateComment from "./comment.vue";
import AppComments from "@/components/comments/index.vue";
import { kFormatter } from "@/utils/index";

export default {
  name: "Post",
  components: { AppText, "create-comment": CreateComment, AppComments },
  props: {
    data: {
      type: Object,
      default: () => ({}),
      required: true,
    },
    showComments: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  data() {
    return {
      isMember: false,
      createComment: null,
      modal: false,
    };
  },
  computed: {
    rooms() {
      return this.$store.state.rooms;
    },
    fullname() {
      const { user } = this.data;
      return user
        ? `${user.firstName} ${user.lastName}` // get the fullname
        : `${this.data.firstName} ${this.data.lastName}`; // get the fullname
    },
    username() {
      const { user } = this.data;
      return user ? `${user.username}` : `${this.data.username}`; // get the username
    },
    comments() {
      const { comments } = this.data;
      return comments;
    },
  },
  // watch: {
  //   isMember(value) {
  //     console.log("isMember", value);
  //   },
  // },

  created() {
    this.getRoom();
  },
  methods: {
    kFormatter,
    addComment(id) {
      this.createComment = id; // set the create comment
      this.modal = !this.modal; // open modal
    },
    closeModal(value) {
      this.modal = value; // close modal
      this.createComment = null; // reset the create comment
    },
    gotoPost() {
      this.$store.commit("setSinglePost", this.data);
      this.$router.push(`/threads/post/${this.data.id}`);
    },
    gotoProfile(user) {
      this.$router.push(`/profile/${user}`);
    },
    async handleComment(data) {
      const oldComments = this.data.comments; // get old comments
      this.data.comments = [data, ...oldComments]; // add new comment to the old comments
      // get particular comment
      const children = document.getElementById(this.createComment).children;
      children[0].classList = "interacted"; // add class to show you commented
      const span = children[1].innerHTML.replace(/\D/g, ""); // get the number of comments
      const spanText = parseInt(span); // convert to integer
      children[1].innerHTML = spanText + 1; // add 1 to the number of comments
      this.createComment = null; // reset the create comment
    },
    async like(id) {
      // like a post
      const children = document.getElementById(id).children;
      const search = children[0].classList.contains("interacted"); // check if you have liked the post
      if (search) {
        // if you have liked the post
        children[0].classList = ""; // remove the class
        const span = children[1].innerHTML.replace(/\D/g, ""); // get the number of likes
        const spanText = parseInt(span); // convert to integer
        children[1].innerHTML = spanText - 1; // subtract 1 from the number of likes
      } else {
        // if you have not liked the post
        children[0].classList = "interacted"; // add class to show you liked the post
        const span = children[1].innerHTML.replace(/\D/g, ""); // get the number of likes
        const spanText = parseInt(span); // convert to integer
        children[1].innerHTML = spanText + 1; // add 1 to the number of likes
      }

      await this._like();
    },
    async dislike(id) {
      // like a post
      const children = document.getElementById(id).children;
      const search = children[0].classList.contains("disliked"); // check if you have liked the post
      if (search) {
        // if you have liked the post
        children[0].classList = ""; // remove the class
        // subtract 1 from the number of likes
      } else {
        // if you have not liked the post
        children[0].classList = "disliked"; // add class to show you liked the post
      }

      await this._dislike();
    },
    async _dislike() {
      this.$axios.$patch(`/posts/dislike/${this.data.id}`).catch((error) => {
        this.$toast.error(error.response.data.message);
      });
    },
    async _like() {
      this.$axios.$patch(`/posts/like/${this.data.id}`).catch((error) => {
        this.$toast.error(error.response.data.message);
      });
    },
    getRoom() {
      const memeber = this.rooms.filter(
        (room) =>
          parseInt(room.discussionsId) === parseInt(this.data.discussions.id)
      );

      return memeber.length >= 1
        ? (this.isMember = true)
        : (this.isMember = false);
    },
  },
};
</script>

<style lang="scss"></style>
