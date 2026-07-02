<template>
  <modal title="Create Post" :active="modal" v-on:closeModal="closeModal">
    <template v-slot:content>
      <div class="p-2">
        <app-textarea
          label="Create Post"
          v-model="form.message"
          height="20vh"
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
  name: "CreatePost",
  props: {
    discussion: {
      type: Array,
      required: true,
      default: [],
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
        attachments: {},
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
        discussionsId: this.discussion.id,
        attachments: this.form.attachments,
        message: this.form.message,
      };

      this.$axios
        .$post("/posts/create", data)
        .then((response) => {
          this.form.isLoading = false;
          this.$toast.success(response.message);
          this.$emit("post", response.data);
          this.form = {
            message: "",
            attachments: {},
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
