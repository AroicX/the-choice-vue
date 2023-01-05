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
        <AppText variant="24" font="600">Find your account</AppText>
        <AppText
          class="my-2"
          variant="14"
          font="300"
          lineHeight="21px"
          hex="#404040"
          >Please enter the email, username or phone <br />
          number on your account.</AppText
        >
      </div>
      <form @submit.prevent="handleLogin">
        <AppInput
          label="Phone Number"
          type="text"
          placeholder="Enter your phone number"
          v-model="form.phone"
          required
        ></AppInput>

        <Button width="100%" type="submit" :loading="form.isLoading"
          >Submint</Button
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
  name: "forgot-password",
  components: { AppText, AppInput, Button },
  data() {
    return {
      form: {
        phone: "+2348187833885",
        isLoading: false,
      },
    };
  },
  methods: {
    async handleLogin() {
      this.form.isLoading = true;

      this.$axios
        .$post("/auth/forgot-password", {
          phoneNo: this.form.phone,
        })
        .then((response) => {
          this.form.isLoading = false;
          console.log(response);
          // this.$toast.success(response.message);
          // this.$router.push("/home");
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
