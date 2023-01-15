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
      <form @submit.prevent="forgetPassword" v-if="step === 'phone'">
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
      <form @submit.prevent="handleOTP" v-if="step === 'otp'">
        <div class="my-5">
          <div class="length">
            OTP expires in <span>{{ timeLeft }}</span>
          </div>
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

        <!-- <button
          class="my-5 underline cursor-pointer text-green-600"
          :disabled="timeLeft !== '00:00'"
          @click.prevent="resendOtp"
        >
          Resend OTP
        </button> -->
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
      time: 600,
      timer: null,
      timerCount: 600,
      duration: "",
      step: "phone",
      form: {
        phone: "07016762847",
        reference_id: "a24e5690-9ece-4ef1-a9ec-de33c9149959",
        isLoading: false,
      },
    };
  },
  computed: {
    timeLeft() {
      return `${this.minutes}:${this.seconds}`;
    },
    minutes() {
      return String(Math.floor(this.time / 60)).padStart(2, "0");
    },
    seconds() {
      return String(this.time % 60).padStart(2, "0");
    },
  },
  methods: {
    async forgetPassword() {
      this.form.isLoading = true;

      const phoneNo = this.form.phone.slice(1);

      this.$axios
        .$post("/auth/forgot-password", {
          phoneNo: phoneNo,
        })
        .then((response) => {
          // console.log(response);
          this.form.isLoading = false;
          this.$toast.success(response.message);
          this.form.reference_id = response.data[0].reference_id;
          this.step = "otp";
          this.startCounter();
          // this.$router.push("/home");
        })
        .catch((error) => {
          this.form.isLoading = false;
          this.$toast.error(error.response.data.message);
        });
    },
    async handleOTP(value = null) {
      this.form.isLoading = true;

      this.$axios
        .$patch("/auth/forget-password-validation", {
          phoneNo: this.form.phone,
          code: this.code || value,
          reference_id: this.form.reference_id,
        })
        .then((response) => {
          this.form.isLoading = false;
          this.$toast.info(response.message);
          this.$router.push({
            path: `/auth/reset-password/${response.data.resetResquest}`,
            query: {
              email: response.data.email,
              phone: response.data.phoneNo,
            },
          });
        })
        .catch((error) => {
          this.form.isLoading = false;
          this.$toast.error(error.response.data.message);
        });
    },
    async handleOnComplete(value) {
      this.code = value;
      await this.handleOTP(value);
    },
    handleOnChange(value) {
      console.log("OTP changed: ", value);
    },
    handleClearInput() {
      this.$refs.otpInput.clearInput();
    },
    startCounter() {
      if (this.timer) {
        clearInterval(this.timer);
      }
      this.time = 600;
      this.timer = setInterval(this.decrementOrAlert, 1000);
    },
    decrementOrAlert() {
      if (this.time > 0) {
        this.time--;
        return;
      }
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

.length {
  text-align: left;
  font-size: 12px;
  font-weight: 400;

  color: #2eae4e;
  margin: 0.5rem 0;
  span {
    font-size: 14px;
    font-weight: 600;
    color: #2eae4e;
  }
}
</style>
