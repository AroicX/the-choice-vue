<template>
  <div class="c_tabs">
    <div class="c_tabs--header">
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        class="c_tabs--header--tab"
        :class="activeTab === tab.content ? 'c_tabs--header--tab-active' : ''"
        @click="$emit('tab-click', tab.content)"
      >
        <AppText variant="14" font="600" color="black">{{
           tab.title
        }}</AppText>
      </button>
    </div>
    <div class="c_tabs--content" v-for="(tab, index) in tabs" :key="index">
      <slot :name="tab.content" v-if="activeTab === tab.content"></slot>
    </div>
  </div>
</template>

<script>
import AppText from "@/reusables/Text.vue";

export default {
  name: "Tabs",
  components: { AppText },
  props: {
    tabs: {
      type: Array,
      default: () => [],
    },
    activeTab: {
      type: String,
      default: "",
    },
  },
};
</script>

<style></style>
