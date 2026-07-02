<template>
  <modal title="Comment" :active="modal" v-on:closeModal="closeModal">
    <template v-slot:content>
      <div class="p-2">
        <app-textarea
          label="Comment"
          v-model="form.message"
          height="10vh"
        ></app-textarea>
        <div class="w-full flex justify-between">
          <div></div>
          <Button
            height="30px"
            width="100px"
            borderRadius="3rem"
            :disabled="validate"
            :loading="form.isLoading"
            @click="createPost"
            >Post</Button
          >
        </div>
      </div>
    </template>
  </modal>
</template>

<script>
import AppText from "@/reusables/Text.vue";
import Modal from "reusables/Modal.vue";
import AppTextarea from "reusables/Textarea.vue";
import Button from "reusables/Button.vue";
export default {
  name: "CreateComment",
  props: {
    postId: {
      type: Number | String,
      required: true,
    },
    comments: {
      type: Array || Object,
      default: [{}],
    },
    modal: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    AppText,
    Modal,
    "app-textarea": AppTextarea,
    Button,
  },
  data() {
    return {
      form: {
        message: "",
        isLoading: false,
      },
    };
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
    validate() {
      return this.form.message.length < 0;
    },
  },
  methods: {
    closeModal(data) {
      this.$emit("closeModal", data);
    },
    async createPost() {
      this.form.isLoading = true;

      const data = {
        message: this.form.message,
      };

      this.$axios
        .$post(`/comments/create/${this.postId}`, data)
        .then((response) => {
          this.form.isLoading = false;
          this.$toast.success(response.message);
          this.$emit("newComment", response.comment);
          this.form = {
            message: "",
            isLoading: false,
          };
          this.closeModal(false);
        })
        .catch((error) => {
          this.form.isLoading = false;
          this.$toast.error(error.response.data.message);
        });
    },
  },
};
</script>

<style></style>
