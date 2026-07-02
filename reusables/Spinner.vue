<template>
  <div class="c_spinner-container" v-if="loading">
    <div class="spinner">
      <div></div>
      <div></div>
      <div></div>
    </div>

    <p>Page Loading . . .</p>
  </div>
</template>

<script>
export default {
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
  },
  name: "Spinner",
};
</script>

<style lang="scss">
.c_spinner-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 5rem 0;
  align-self: center;
  align-items: center;
  align-content: center;

  p {
    font-size: 14px;
    font-weight: 500;
    margin: 2rem 0;
    color: #c9c9c9;
  }
}
.spinner {
  display: flex;

  div {
    background: #2eae4e;
    width: 15px;
    height: 15px;
    border-radius: 3rem;
    margin: 0 0.2rem;
    transition: all 0.6s ease-in-out;
    animation: shrink 2s ease-in-out infinite;
    box-shadow: 0px 5px 15px rgba(106, 127, 130, 0.09);
  }

  @keyframes shrink {
    0% {
      width: 20px;
      height: 20px;
      background: #32c456;
      transition: all 0.6s ease-in-out;
    }
    50% {
      width: 10px;
      height: 10px;
      background: #20d44d;
      transition: all 0.6s ease-in-out;
    }

    100% {
      width: 20px;
      height: 20px;
      background: #2eae4e;
      transition: all 0.6s ease-in-out;
    }
  }
}
</style>
