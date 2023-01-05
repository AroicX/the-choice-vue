<template>
  <div class="c_discussion-about">
    <AppText variant="16" font="600">Forum Info</AppText>
    <div class="wd-75 my-3">
      <AppText variant="14" font="300" textAlign="left" lineHeight="21px"
        >This forum is used to discourse insecurity in nigeria, way forward,
        safety tips and major challenges concerning security in nigeria.
      </AppText>
    </div>
    <div>
      <div class="flex p-3">
        <img class="my-auto mr-5" src="/svgs/discussion/group.svg" alt="icon" />
        <AppText variant="16" font="300" color="black2"
          >Only member can post, comment, like or share</AppText
        >
      </div>
      <div class="flex p-3">
        <img class="my-auto mr-5" src="/svgs/discussion/globe.svg" alt="icon" />

        <AppText variant="16" font="300" color="black2"
          >All forums are publicly visible</AppText
        >
      </div>
      <div class="flex p-3">
        <img
          class="my-auto mr-5"
          src="/svgs/discussion/shield.svg"
          alt="icon"
        />

        <AppText variant="16" font="300" color="black2">
          Created by Choice9ja</AppText
        >
      </div>
    </div>
    <div class="my-5">
      <AppText variant="16" font="600">Rules & Conducts</AppText>

      <div class="wd-75 my-3">
        <AppText variant="14" font="300" textAlign="left" lineHeight="21px"
          >These are rules set of by Choice9ja enforce by Choice9ja are in
          addition to Choice Rules.
        </AppText>
      </div>
    </div>
  </div>
</template>

<script>
import AppText from "@/reusables/Text.vue";

export default {
  name: "about-discussion",
  components: { AppText },
  
};
</script>

<style></style>
