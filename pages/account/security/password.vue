<template>
  <div class="c_setting-security">
    <div class="c_setting-header">
      <button @click.prevent="to">
        <img class="my-auto" src="/svgs/back.svg" alt="back" />
      </button>
      <nuxt-link to="/home">
        <AppText variant="16" font="500">Change Password </AppText>
      </nuxt-link>
      <div></div>
      <div></div>
    </div>

    <div class="c_setting-security_content">
      <AppText variant="28" font="600" hex="#454F54">Change Password</AppText>
      <div class="my-5">
        <AppText variant="12" font="300" hex="#B2B6B8"
          >Change your password to a new one</AppText
        >
      </div>
      <form @submit.prevent="changePassword">
        <AppInput
          label="Old Password"
          type="password"
          placeholder="Enter your old password"
          v-model="form.old_password"
          required
        ></AppInput>
        <AppText class="uppercase my-3" variant="12" font="300" hex="#B2B6B8"
          >New password</AppText
        >

        <AppInput
          label="Password"
          type="password"
          placeholder="Enter your password"
          v-model="form.password"
          required
        ></AppInput>
        <AppInput
          label="Confirm Password"
          type="password"
          placeholder="Enter your password"
          v-model="form.c_password"
          required
        ></AppInput>
        <Button
          type="submit"
          class="btn btn-primary"
          width="100%"
          :loading="form.isLoading"
          :disabled="validate"
          >Change Password</Button
        >
      </form>
    </div>
  </div>
</template>

<script>
import AppText from "@/reusables/Text.vue";
import AppInput from "@/reusables/Input.vue";
import Button from "@/reusables/Button.vue";

export default {
  name: "account-security-password",
  components: { AppText, AppInput, Button },
  data() {
    return {
      form: {
        old_password: "password",
        password: "password",
        c_password: "password",
        isLoading: false,
      },
    };
  },
  computed: {
    validate() {
      return (
        this.form.old_password.length < 1 ||
        this.form.password.length < 1 ||
        this.form.c_password.length < 1
      );
    },
  },
  methods: {
    changeTab(tab) {
      this.activeTab = tab;
    },
    to() {
      this.$router.go(-1);
    },
    async changePassword() {
      this.form.isLoading = true;

      this.$axios
        .$patch("/users/password-reset", {
          old_password: this.form.old_password,
          password: this.form.password,
          c_password: this.form.c_password,
        })
        .then((response) => {
          this.form.isLoading = false;
          this.$toast.success(response.message);
          window.localStorage.clear();
          this.$store.commit("setUser", null);
          this.$store.commit("setToken", null);
          this.$store.commit("setAuthenticated", null);
          this.$router.push("/auth/login");
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
