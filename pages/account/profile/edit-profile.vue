<template>
  <div class="c_setting-security">
    <div class="c_setting-header">
      <button @click.prevent="to">
        <img class="my-auto" src="/svgs/back.svg" alt="back" />
      </button>
      <nuxt-link to="/home">
        <AppText variant="16" font="500"
          >{{ user.username + `'s` }} Profile
        </AppText>
      </nuxt-link>
      <div></div>
      <div></div>
    </div>

    <div class="c_setting-security_content">
      <AppText variant="28" font="600" hex="#454F54">Edit Profile</AppText>
      <div class="my-5">
        <AppText variant="12" font="300" hex="#B2B6B8"
          >Change your password to a new one</AppText
        >
      </div>
      <form @submit.prevent="changePassword">
        <div
          class="c_setting-profile-image"
          :style="{
            backgroundImage: `url(${
              previewImage ? previewImage : user.profilePic
            })`,
          }"
        ></div>

        <div class="my-2">
          <input
            type="file"
            hidden
            placeholder="Select New Photo"
            ref="photo"
            @change="handleImage"
          />

          <button
            type="button"
            class="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:text-gray-500 focus:outline-none focus:border-blue-400 focus:shadow-outline-blue active:text-gray-800 active:bg-gray-50 transition ease-in-out duration-150 mt-2 outline-none"
            :disabled="form.isLoading"
            @click="$refs.photo.click()"
          >
            Select New Photo
          </button>
        </div>
        <div class="bg-[#F1998E] p-2 rounded-md my-5">
          <AppText
            class="uppercase my-3"
            variant="12"
            font="500"
            hex="#fff"
            lineHeight="21px"
            >NOTE: You can't change your Email or Phone Number or
            usename</AppText
          >
        </div>
        <!-- <AppInput
          label="Email"
          type="email"
          v-model="user.email"
          :disabled="true"
        ></AppInput>
        <AppInput
          label="Phone Number"
          type="text"
          v-model="user.phoneNo"
          :disabled="true"
        ></AppInput> -->
        <AppText class="uppercase my-3" variant="12" font="300" hex="#B2B6B8"
          >Update Details</AppText
        >

        <AppInput
          label="First Name"
          type="text"
          placeholder="Enter your first name"
          v-model="form.firstName"
          required
          :disabled="form.isLoading"
        ></AppInput>

        <AppInput
          label="Last Name"
          type="text"
          placeholder="Enter your last name"
          v-model="form.lastName"
          required
          :disabled="form.isLoading"
        />
        <AppInput
          label="UserName"
          type="text"
          placeholder="Enter your username"
          v-model="form.username"
          required
          :disabled="form.isLoading"
        />
        <app-textarea
          label="About Yourself"
          v-model="form.about"
          height="20vh"
          :disabled="form.isLoading"
        ></app-textarea>

        <Button
          type="submit"
          class="btn btn-primary"
          width="100%"
          :loading="form.isLoading"
          :disabled="validate"
          >Continue</Button
        >
      </form>
    </div>
  </div>
</template>

<script>
import AppText from "@/reusables/Text.vue";
import AppInput from "@/reusables/Input.vue";
import Textarea from "@/reusables/Textarea.vue";
import Button from "@/reusables/Button.vue";
import axios from "axios";

export default {
  name: "account-edit-profile",
  components: { AppText, AppInput, Button, "app-textarea": Textarea },
  data() {
    return {
      file: null,
      previewImage: null,
      form: {
        firstName: "",
        lastName: "",
        // username: "",
        about: "",
        profile_image: null,
        isLoading: false,
      },
    };
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
    validate() {
      return (
        this.form.firstName == "" ||
        this.form.lastName == "" ||
        this.form.username == "" ||
        this.form.about == ""
      );
    },
  },
  created() {
    this.form.firstName = this.user.firstName;
    this.form.lastName = this.user.lastName;
    this.form.username = this.user.username;
    this.form.about = this.user.about;
  },
  methods: {
    changeTab(tab) {
      this.activeTab = tab;
    },
    to() {
      this.$router.go(-1);
    },
    async handleImage(event) {
      const file = event.target.files[0];
      this.file = file;
      const link = URL.createObjectURL(file);
      this.previewImage = link;
    },
    async uploadImage() {
      const formData = new FormData();
      formData.append("file", this.file, this.file.name);
      formData.append("upload_preset", "chioce");
      await axios
        .post(
          "https://api.cloudinary.com/v1_1/dxakg8zuk/image/upload",
          formData
        )
        .then((response) => {
          const { data } = response;
          // this.form.profile_image = {
          //   public_id: data.public_id,
          //   url: data.url,
          // };
          this.form.profile_image = data.url;
        })
        .catch((error) => {
          this.$toast.error(error.response.data.message);
        });
    },
    async changePassword() {
      this.form.isLoading = true;
      if (this.previewImage) {
        await this.uploadImage();
      }
      const { firstName, lastName, about, profile_image } = this.form;
      // console.log({
      //   firstName,
      //   lastName,
      //   about,
      //   profile_image: profile_image || this.user.profilePic,
      // });
      // return;
      this.$axios
        .$patch("users/me", {
          firstName,
          lastName,
          about,
          profilePic: profile_image || this.user.profilePic,
        })
        .then((response) => {
          console.log(response);
          this.form.isLoading = false;
          this.$toast.success(response.message);
          this.$store.commit("setUser", response.data);
          this.to();
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
