<template>
  <main>
    <div class="c_auth">
      <div class="c_auth-onboarding">
        <img src="/svgs/logo.svg" alt="logo" />
        <div class="my-10">
          <AppText variant="34" color="green" font="500">Choice9ja</AppText>

          <AppText
            class="my-2"
            variant="18"
            font="300"
            color="grey"
            lineHeight="21px"
          >
            A place for nigerians to learn about <br />
            politicians & parties, <br />
            raise issues and pseudo-vote candidates.
          </AppText>
        </div>

        <div class="mb-10">
          <AppText class="my-5" variant="18" color="black" font="500"
            >Join Choice9ja today.</AppText
          >
          <nuxt-link to="create-account">
            <Button width="100%" borderRadius="3rem"
              >Sign up with Phone Number</Button
            >
          </nuxt-link>
          <nuxt-link to="create-account">
            <Button class="my-5" width="100%" borderRadius="3rem"
              >Sign up with email</Button
            >
          </nuxt-link>

          <AppText variant="14" color="grey" lineHeight="21px">
            By signing up, you agreee to our
            <AppText color="green"
              >Terms of Service and Privacy Policy.</AppText
            >
          </AppText>
        </div>

        <AppText class="my-2" variant="18" color="black" font="600"
          >Already have an account?</AppText
        >

        <nuxt-link to="login">
          <Button
            type="submit"
            width="100%"
            variant="transparent"
            borderRadius="3rem"
            font="500"
            >Log In</Button
          >
        </nuxt-link>
      </div>
    </div>
  </main>
</template>

<script>
import Button from "@/reusables/Button.vue";
import AppText from "@/reusables/Text.vue";
import AppInput from "@/reusables/Input.vue";

export default {
  name: "Auth_Onboarding",
  components: { Button, AppText, AppInput },
  Textame: "Onboarding",
  data() {
    return {
      fullname: "",
    };
  },
  watch: {
    fullname(value) {
      console.log("fullname", value);
    },
  },
  methods: {
    login() {
      alert("this is a button");
    },
  },
};
</script>

<style lang="scss">
.c_auth {
  width: 100%;
  &-onboarding {
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
