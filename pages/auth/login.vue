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
        <AppText variant="18" font="600">Login to your account</AppText>
      </div>
      <form @submit.prevent="handleLogin">
        <AppInput
          v-if="loginType === 'email'"
          label="Email"
          type="email"
          placeholder="Enter your email"
          v-model="form.email"
          required
        ></AppInput>
        <AppInput
          v-if="loginType === 'phone'"
          label="Phone Number"
          type="number"
          placeholder="Enter your Phone Number"
          v-model="form.phoneNo"
          required
        ></AppInput>

        <button type="button" @click.prevent="changeLoginType">
          <AppText class="underline my-2" variant="12" color="green" font="500"
            >Use {{ loginType === "email" ? "Phone Number" : "Email" }}</AppText
          >
        </button>

        <AppInput
          type="password"
          label="Password"
          placeholder="Enter your Password"
          v-model="form.password"
          required
        ></AppInput>

        <div class="flex py-8 justify-between">
          <nuxt-link to="forgot-password">
            <AppText variant="12" font="400">Forgot Password?</AppText>
          </nuxt-link>
          <nuxt-link to="verify">
            <AppText class="underline" variant="12" color="green" font="500"
              >Verify Phone Number</AppText
            >
          </nuxt-link>
        </div>
        <Button width="100%" type="submit" :loading="form.isLoading"
          >Continue</Button
        >
        <div class="flex justify-center my-5">
          <AppText variant="14" color="grey"
            >Don’t have an account?
            <nuxt-link to="/auth/create-account" class="text-green-600"
              >Sign Up</nuxt-link
            >
          </AppText>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import AppText from "@/reusables/Text.vue";
import AppInput from "@/reusables/Input.vue";
import Button from "reusables/Button.vue";

export default {
  name: "Login",
  components: { AppText, AppInput, Button },
  middleware: "index",
  data() {
    return {
      loginType: "email",
      form: {
        email: "",
        phoneNo: "",
        password: "",
        isLoading: false,
      },
    };
  },
  computed: {
    isAuthenticated() {
      return this.$store.state.isAuthenticated;
    },
  },
  mounted() {
    this.isAuthenticated ? this.$router.push("/home") : null;
  },
  methods: {
    changeLoginType() {
      if (this.loginType === "email") {
        return (this.loginType = "phone");
      }

      if (this.loginType === "phone") {
        return (this.loginType = "email");
      }
    },

    async handleLogin() {
      this.form.isLoading = true;

      const data = {
        password: this.form.password,
      };
      if (this.loginType === "email") {
        data.email = this.form.email;
      }
      if (this.loginType === "phone") {
        data.phoneNo = this.form.phoneNo;
      }
      this.$axios
        .$post("/auth/login", data)
        .then((response) => {
          this.form.isLoading = false;
          window.localStorage.setItem("token", JSON.stringify(response.token));
          window.localStorage.setItem("user", JSON.stringify(response.user));
          this.$store.commit("setUser", response.user);
          this.$store.commit("setToken", response.token);
          this.$store.commit("setAuthenticated", true);

          this.$toast.success("Login Successful");
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
