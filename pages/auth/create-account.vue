<template>
  <div class="c_auth">
    <div class="c_auth-create">
      <div class="my-5">
        <img src="/svgs/logo.svg" alt="logo" />
        <br />
        <AppText variant="24" color="green" font="500">Choice9ja</AppText>
      </div>

      <div class="my-1">
        <AppText class="" variant="28" font="600">Create your account</AppText>
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
      <form @submit.prevent="createAccount">
        <AppInput
          label="First Name"
          placeholder="Enter your FirstName"
          v-model="form.firstName"
        ></AppInput>

        <AppInput
          label="Last Name"
          placeholder="Enter your FirstName"
          v-model="form.lastName"
        ></AppInput>

        <AppInput
          label="Email"
          type="email"
          placeholder="Enter your email"
          v-model="form.email"
        ></AppInput>

        <AppInput
          label="Phone Number"
          type="number"
          placeholder="Enter your Phone Number"
          v-model="form.phoneNo"
        ></AppInput>

        <AppInput
          label="Username"
          placeholder="Enter your Username"
          v-model="form.username"
        ></AppInput>

        <AppInput
          type="password"
          label="Password"
          placeholder="Enter your Password"
          v-model="form.password"
        ></AppInput>

        <AppInput
          type="password"
          label="Confirm Password"
          placeholder="Enter your Confirm Password"
          v-model="form.c_password"
        ></AppInput>

        <div class="w-full">
          <Button
            type="submit"
            width="100%"
            :loading="form.isLoading"
            :disabled="validate"
            >Create Account</Button
          >
        </div>
      </form>
      <div class="flex justify-center my-5">
        <AppText variant="14" color="grey"
          >Already have an account?
          <nuxt-link to="login" class="text-green-600">Login</nuxt-link>
        </AppText>
      </div>
    </div>
  </div>
</template>

<script>
import AppText from "@/reusables/Text.vue";
import AppInput from "@/reusables/Input.vue";
import Button from "reusables/Button.vue";

export default {
  name: "CreateAccount",
  components: { AppText, AppInput, Button },
  computed: {
    validate() {
      return (
        this.form.firstName === "" ||
        this.form.lastName === "" ||
        this.form.username === "" ||
        this.form.phoneNo === "" ||
        this.form.email === "" ||
        this.form.password === "" ||
        this.form.c_password === ""
      );
    },
  },
  data() {
    return {
      form: {
        firstName: "",
        lastName: "",
        username: "",
        phoneNo: "",
        email: "",
        password: "",
        c_password: "",
        // firstName: "Sanusi",
        // lastName: "Mubaraq",
        // username: "matrix",
        // phoneNo: "08132554349",
        // email: "mubaraqsanusi908@gmail.com",
        // password: "password",
        // c_password: "password",
        isLoading: false,
      },
    };
  },
  methods: {
    createAccount() {
      // compare passwords
      if (this.form.password !== this.form.c_password) {
        return this.$toast.error("Passwords do not match");
      }
      this.form.isLoading = true;
      const { firstName, lastName, username, phoneNo, email, password } =
        this.form;
      const data = {
        firstName,
        lastName,
        username,
        phoneNo,
        email,
        password,
      };

      this.$axios
        .$post("auth/signup", data)
        .then((response) => {
          // console.log("response", response);
          this.form.isLoading = false;
          this.$toast.success("Account Created Successfully");
          this.$router.push("/auth/login");
        })
        .catch((error) => {
          this.form.isLoading = false;
          return this.$toast.error(error.response.data.message);
        });
    },
  },
};
</script>

<style lang="scss">
.c_auth {
  width: 100%;
  padding-bottom: 5rem;

  &-create {
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
