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
        <AppText variant="24" font="600">Verify your account</AppText>
        <AppText
          class="my-2"
          variant="14"
          font="300"
          lineHeight="21px"
          hex="#404040"
          >Please enter the code, sent your phone <br />
          number or email on your account.</AppText
        >
      </div>
      <form @submit.prevent="handleLogin" v-if="step === 'phone'">
        <AppInput
          label="Phone Number"
          type="number"
          placeholder="Enter your phone number"
          v-model="form.phone"
          required
        ></AppInput>

        <Button width="100%" type="submit" :loading="form.isLoading"
          >Contiune</Button
        >
      </form>
      <form @submit.prevent="handleLogin" v-if="step === 'otp'">
        <div class="my-5">
          <v-otp-input
            ref="otpInput"
            input-classes="otp-input"
            separator=""
            :num-inputs="6"
            :should-auto-focus="true"
            :is-input-num="true"
            @on-change="handleOnChange"
            @on-complete="handleOnComplete"
          />
        </div>

        <Button width="100%" type="submit" :loading="form.isLoading"
          >Confirm</Button
        >
      </form>
    </div>
  </div>
</template>

<script>
import AppText from "@/reusables/Text.vue";
import AppInput from "@/reusables/Input.vue";
import Button from "reusables/Button.vue";
import OtpInput from "@bachdgvn/vue-otp-input";

export default {
  name: "forgot-password",
  components: { AppText, AppInput, Button, "v-otp-input": OtpInput },
  data() {
    return {
      step: "otp",
      form: {
        phone: "",
        password: "password",
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
    handleOnComplete(value) {
      console.log("OTP completed: ", value);
    },
    handleOnChange(value) {
      console.log("OTP changed: ", value);
    },
    handleClearInput() {
      this.$refs.otpInput.clearInput();
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
.otp-input {
  width: 40px;
  height: 40px;
  padding: 5px;
  margin: 0 1rem;
  font-size: 20px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.3);
  text-align: center;
  outline: none;
  &:focus {
    border: 1px solid #2eae4e;
  }
  &:nth-child(1) {
    margin-left: 0;
  }
  &.error {
    border: 1px solid red !important;
  }

  input {
    border: 1px solid #2eae4e;
    outline: none;
  }
}
.otp-input::-webkit-inner-spin-button,
.otp-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
