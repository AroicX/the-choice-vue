<template>
  <p
    class="c_text"
    :class="[isVariant, isColor, isFont]"
    :style="{
      textAlign,
      lineHeight,
      color: `${hex} !important`,
    }"
  >
    <slot></slot>
  </p>
</template>

<script>
export default {
  name: "AppText",
  props: {
    variant: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      default: "",
    },
    font: {
      type: String,
      default: "",
    },
    textAlign: {
      type: String,
      default: "",
    },
    lineHeight: {
      type: String,
      default: "",
    },
    hex: {
      type: String,
      default: "",
    },
  },
  computed: {
    isVariant() {
      return `c_text--${this.variant}`;
    },
    isColor() {
      return `c_text--${this.color}`;
    },
    isFont() {
      return this.font ? `font-${this.font}` : "";
    },
    // isHex() {
    //   return `bg-[${this.hex}]`;
    // },
  },
};
</script>

<style></style>
