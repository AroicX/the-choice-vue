export const state = () => ({
  user: [],
  isAuthenticated: false,
  token: null,
  singlePost: null,
  posts: [],
  discussions: [],
  rooms: [],
  elections: [],
  notifications: 0,
});

export const mutations = {
  setUser: (state, payload) => {
    state.user = payload;
  },
  setAuthenticated: (state, payload) => {
    state.isAuthenticated = payload;
  },
  setToken: (state, payload) => {
    state.token = payload;
  },
  setSinglePost: (state, payload) => {
    state.singlePost = payload;
  },
  setPosts: (state, payload) => {
    state.post = payload;
  },
  setDiscussion: (state, payload) => {
    state.discussions = payload;
  },
  setRooms: (state, payload) => {
    state.rooms = payload;
  },
  setElections: (state, payload) => {
    state.elections = payload;
  },
  setNotifications: (state, payload) => {
    state.notifications = payload;
  },
};
export const actions = {
  logout: () => {
    localStorage.clear();
  },
};
