<template>
  <div class="c_cusutom">
    <textarea
      class="c_textarea"
      :type="type"
      :value="value"
      :placeholder="label"
      v-bind="$attrs"
      @input="$emit('input', $event.target.value)"
      autocomplete="off"
      :required="required"
      :style="{
        height,
      }"
    ></textarea>
    <label :for="label">{{ label }}</label>
  </div>
</template>

<script>
export default {
  name: "AppTextarea",
  props: {
    label: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "text",
    },
    value: {
      type: [String, Number],
      default: "",
    },
    placeholder: {
      type: String,
      default: "",
    },
    required: {
      type: Boolean,
      default: false,
    },
    height: {
      type: String,
      default: "",
    },
  },
};
</script>

<style></style>
