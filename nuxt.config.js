import { resolve } from "path";
export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: "Choice9ja",
    htmlAttrs: {
      lang: "en",
    },
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: "" },
      { name: "format-detection", content: "telephone=no" },
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "../favicon.ico" }],
  },

  alias: {
    reusables: resolve(__dirname, "./reusables"),
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ["@/scss/index.scss"],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: ["~/plugins/axios", "~/plugins/persistedState.client.js"],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/tailwindcss
    "@nuxtjs/tailwindcss",
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: ["@nuxtjs/axios", "@nuxtjs/toast"],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    // extend(config, ctx) {
    //   if (ctx.isDev) {
    //     config.devtool = ctx.isClient ? "source-map" : "inline-source-map";
    //   }
    // },
  },
  server: {
    port: 3008, // default: 3000
    // host: "0.0.0.0",
  },
  axios: {
    baseURL:
      process.env.NODE_ENV === "development"
        ? process.env.DEV_URL
        : process.env.BASE_URL, // Used as fallback if no runtime config is provided
  },
  toast: {
    position: "top-center",
    duration: 5000,
    // close: true,
    register: [
      // Register custom toasts
      {
        name: "my-error",
        message: "Oops...Something went wrong",
        options: {
          type: "error",
        },
      },
    ],
  },
};
