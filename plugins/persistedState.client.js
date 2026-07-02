// import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";

// const store = new Vuex.Store({
//   // ...
//   plugins: [createPersistedState()],
// });



export default ({ store }) => {
  createPersistedState()(store);
};