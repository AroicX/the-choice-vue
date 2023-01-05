<template>
  <div class="c_auth">
    <div class="c_auth-login">
      <div class="my-5">
        <img src="/svgs/logo.svg" alt="logo" />

        <br />
        <br />
        <br />
        <AppText variant="24" color="green" font="500">Choice9ja</AppText>
      </div>

      <div class="my-5">
        <AppText variant="24" font="600">Reset Password</AppText>
        <AppText
          class="my-2"
          variant="14"
          font="300"
          lineHeight="21px"
          hex="#404040"
          >Ahmed, create a password you can remember to secure your
          account.</AppText
        >
      </div>
      <form @submit.prevent="handleLogin">
        <AppInput
          label="Password"
          type="password"
          placeholder="Enter your Password"
          v-model="form.password"
          required
        ></AppInput>
        <AppInput
          class="my-2"
          label="Confirm Password"
          type="password"
          placeholder="Enter your Confirm Password"
          v-model="form.c_password"
          required
        ></AppInput>

        <br />
        <br />
        <Button width="100%" type="submit" :loading="form.isLoading"
          >Contiune</Button
        >
      </form>
    </div>
  </div>
</template>

<script>
import AppText from "@/reusables/Text.vue";
import AppInput from "@/reusables/Input.vue";
import Button from "reusables/Button.vue";

export default {
  name: "reset-password",
  components: { AppText, AppInput, Button },
  data() {
    return {
      form: {
        password: "",
        c_password: "",
        isLoading: false,
      },
    };
  },
  methods: {
    async handleLogin() {
      this.form.isLoading = true;

      this.$axios
        .$post("/auth/login", {
          email: this.form.email,
          password: this.form.password,
        })
        .then((response) => {
          this.form.isLoading = false;
          this.$toast.success(response.message);
          this.$router.push("/home");
        })
        .catch((error) => {
          this.form.isLoading = false;
          this.$toast.error(error.response.data.message);
        });
    },
  },
};
</script>

<style lang="scss">
.c_auth {
  width: 100%;
  &-login {
    width: 90%;
    padding: 2rem;
    margin: auto;
    display: flex;
    flex-direction: column;
    height: 100vh;
    img {
      width: 50px;
      height: 50px;
    }
  }
}
</style>
