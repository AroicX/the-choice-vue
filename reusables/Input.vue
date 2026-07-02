<template>
  <div class="c_cusutom">
    <input
      class="c_input"
      :type="type"
      :value="value"
      :placeholder="label"
      v-bind="$attrs"
      @input="$emit('input', $event.target.value)"
      autocomplete="off"
      :required="required"
    />
    <label :for="label">{{ label }}</label>
  </div>
</template>

<script>
export default {
  name: "AppInput",
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
  },
};
</script>

<style></style>
