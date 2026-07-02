<template>
  <div class="c_modal" :class="active ? 'c_modal-active' : ''">
    <div class="c_modal-content">
      <div class="c_modal-content-header">
        <div class="flex-1">
          <AppText
            class="text-black text-lg text-center"
            variant="16"
            font="500"
            >{{ title }}</AppText
          >
        </div>
        <button @click="$emit('closeModal', false)">
          <img
            class="bg-red-50 w-5 h-5 rounded-full cursor-pointer mr-2"
            src="/svgs/modal-close.svg"
            alt="modal-close"
          />
        </button>
      </div>
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script>
import AppText from "@/reusables/Text.vue";
export default {
  name: "Modal",
  props: {
    active: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "",
    },
  },
  components: {
    AppText,
  },
};
</script>

<style></style>
