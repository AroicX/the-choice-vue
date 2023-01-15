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
      <form @submit.prevent="handleRest">
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
        <Button
          width="100%"
          type="submit"
          :loading="form.isLoading"
          :disabled="validate"
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
        slug: "",
        email: "",
        password: "",
        c_password: "",
        isLoading: false,
      },
    };
  },
  computed: {
    validate() {
      return (
        this.form.password === "" ||
        this.form.c_password === "" ||
        this.form.password !== this.form.c_password
      );
    },
  },
  methods: {
    async handleRest() {
      this.form.isLoading = true;

      this.$axios
        .$post("/auth/reset-password", {
          email: this.form.email,
          password: this.form.password,
          confirm_password: this.form.c_password,
        })
        .then((response) => {
          this.form.isLoading = false;
          this.$toast.success(response.message);
          this.$router.push("/auth/login");
        })
        .catch((error) => {
          this.form.isLoading = false;
          this.$toast.error(error.response.data.message);
        });
    },
  },
  created() {
    const { email, phone } = this.$route.query;
    this.form.email = email;
    this.form.phoneNo = phone;

    this.slug = this.$route.params.slug;
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
