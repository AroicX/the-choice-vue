<template>
  <button
    class="c_button"
    :class="[isVariant, isDisabled, isFont]"
    :style="{
      width,
      borderRadius,
    }"
    :disabled="disabled"
    @click="$emit('click', $event)"
    v-bind="$attrs"
  >
    <div class="spinner" v-if="loading">
      <div></div>
      <div></div>
      <div></div>
    </div>

    <slot v-if="!loading"></slot>
  </button>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      default: "Button",
    },
    variant: {
      type: String,
      default: "colored",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    borderRadius: {
      type: String,
      default: "",
    },
    width: {
      type: String,
      default: "",
    },
    font: {
      type: String,
      default: "",
    },
  },
  name: "Button",
  computed: {
    isVariant() {
      switch (this.variant) {
        case "transparent":
          return "c_button--transparent";
        case "colored":
          return "c_button--colored";

        default:
          break;
      }
    },
    isDisabled() {
      return this.disabled ? "c_button--disabled" : "";
    },
    isFont() {
      return this.font ? `font-${this.font}` : "";
    },
  },
  mounted() {
    // console.log(this.isVariant);
  },
};
</script>

<style lang="scss">
.spinner {
  display: flex;

  div {
    background: white;
    width: 15px;
    height: 15px;
    border-radius: 3rem;
    margin: 0 0.2rem;
    /* transition: all 0.6s ease-in-out; */
    animation: shrink 2s ease-in-out infinite;
  }

  @keyframes shrink {
    0% {
      width: 20px;
      height: 20px;
    }
    50% {
      width: 10px;
      height: 10px;
      /* margin: 0 0.5rem; */
      /* transform: translateY(-10px); */
    }
    /* 70% {
      margin: 0 0.1rem;
      transform: translateY(5px);
    } */
    100% {
      width: 20px;
      height: 20px;
    }
  }
}
</style>
