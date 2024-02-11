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
  search: {
    keyword: '',
    posts: [],
    users: [],
  }
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
  setSearch: (state, { keyword, posts, users }) => {
    state.search.keyword = keyword;
    state.search.posts = posts;
    state.search.users = users;
  }
};
export const actions = {
  logout: () => {
    localStorage.clear();
  },
};
