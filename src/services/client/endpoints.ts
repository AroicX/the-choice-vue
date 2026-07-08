export const endpoints = {
  auth: {
    login: "/auth/login",
    signup: "/auth/signup",
    forgotPassword: "/auth/forgot-password",
    validateOtp: "/auth/validate-otp",
    resetPassword: "/auth/reset-password"
  },
  users: {
    me: "/users/me",
    profile: (id: string) => `/users/profile/${id}`,
    search: "/users/search",
    update: "/users/me",
    changePassword: "/users/password-reset"
  },
  feed: {
    home: "/feed/home",
    trending: "/feed/trending",
    following: "/feed/following",
    local: "/feed/local"
  },
  posts: {
    list: "/posts",
    create: "/posts/create",
    trending: "/posts/trending",
    search: "/posts/search",
    detail: (id: string) => `/posts/${id}`,
    byDiscussion: (id: string) => `/posts/discussions/${id}`,
    byUser: (id: string) => `/posts/user/${id}`,
    like: (id: string) => `/posts/like/${id}`,
    dislike: (id: string) => `/posts/dislike/${id}`,
    delete: (id: string) => `/posts/delete/${id}`
  },
  comments: {
    list: "/comments",
    create: (postId: string) => `/comments/create/${postId}`,
    detail: (id: string) => `/comments/${id}`,
    update: (id: string) => `/comments/${id}`,
    delete: (id: string) => `/comments/delete/${id}`
  },
  discussions: {
    list: "/discussions",
    trending: "/discussions/trending",
    detail: (id: string) => `/discussions/${id}`,
    create: "/discussions/create",
    update: (id: string) => `/discussions/update/${id}`,
    delete: (id: string) => `/discussions/delete/${id}`
  },
  rooms: {
    list: "/rooms",
    join: "/rooms/create",
    me: "/rooms/me",
    detail: (id: string) => `/rooms/${id}`,
    update: (id: string) => `/rooms/update/${id}`,
    leave: (id: string) => `/rooms/delete/${id}`
  },
  polls: {
    list: "/polls",
    create: (discussionId: string) => `/polls/create/${discussionId}`,
    detail: (id: string) => `/polls/${id}`,
    byDiscussion: (id: string) => `/polls/discussion/${id}`,
    vote: (id: string) => `/polls/vote/${id}`,
    results: (id: string) => `/polls/result/${id}`,
    update: (id: string) => `/polls/update/${id}`,
    delete: (id: string) => `/polls/delete/${id}`
  },
  elections: {
    list: "/elections",
    create: "/elections/create",
    upload: "/elections/upload",
    banner: "/elections/banner",
    detail: (id: string) => `/elections/${id}`,
    vote: (id: string) => `/elections/vote/${id}`,
    results: (id: string) => `/elections/result/${id}`,
    update: (id: string) => `/elections/update/${id}`,
    delete: (id: string) => `/elections/delete/${id}`
  },
  politicians: {
    list: "/politicians",
    detail: (id: string) => `/politicians/${id}`,
    scorecard: (id: string) => `/politicians/${id}/scorecard`,
    promises: (id: string) => `/politicians/${id}/promises`,
    issues: (id: string) => `/politicians/${id}/issues`,
    ratings: (id: string) => `/politicians/${id}/ratings`,
    create: "/politicians",
    update: (id: string) => `/politicians/${id}`,
    delete: (id: string) => `/politicians/${id}`
  },
  parties: {
    list: "/parties",
    detail: (id: string) => `/parties/${id}`,
    create: "/parties",
    update: (id: string) => `/parties/${id}`,
    delete: (id: string) => `/parties/${id}`
  },
  issues: {
    list: "/issues",
    trending: "/issues/trending",
    detail: (id: string) => `/issues/${id}`,
    create: "/issues",
    update: (id: string) => `/issues/${id}`,
    delete: (id: string) => `/issues/${id}`,
    upvote: (id: string) => `/issues/${id}/upvote`,
    assignPolitician: (id: string) => `/issues/${id}/assign-politician`,
    resolve: (id: string) => `/issues/${id}/resolve`
  },
  ratings: {
    list: "/ratings",
    categories: "/ratings/categories",
    bulk: "/ratings/bulk",
    parties: "/ratings/parties",
    sdgCriteria: "/ratings/sdg-criteria",
    create: "/ratings/candidates",
    vote: (id: string) => `/ratings/candidates/${id}/vote`,
    delete: (id: string) => `/ratings/${id}`,
    leaderboard: "/scorecards/leaderboard"
  },
  scorecards: {
    politician: (id: string) => `/scorecards/politicians/${id}`,
    state: (state: string) => `/scorecards/states/${state}`,
    leaderboard: "/scorecards/leaderboard",
    compare: "/scorecards/compare"
  },
  promises: {
    list: "/promises",
    detail: (id: string) => `/promises/${id}`,
    create: "/promises",
    update: (id: string) => `/promises/${id}`,
    status: (id: string) => `/promises/${id}/status`,
    delete: (id: string) => `/promises/${id}`
  },
  news: {
    list: "/news",
    detail: (id: string) => `/news/${id}`,
    create: "/news",
    update: (id: string) => `/news/${id}`,
    delete: (id: string) => `/news/${id}`,
    factCheck: (id: string) => `/news/${id}/fact-check`,
    summarize: (id: string) => `/news/${id}/summarize`
  },
  factChecks: {
    list: "/fact-checks",
    detail: (id: string) => `/fact-checks/${id}`,
    verifyClaim: "/fact-checks/verify-claim",
    create: "/fact-checks",
    update: (id: string) => `/fact-checks/${id}`,
    delete: (id: string) => `/fact-checks/${id}`
  },
  topics: {
    list: "/topics",
    detail: (id: string) => `/topics/${id}`,
    create: "/topics",
    update: (id: string) => `/topics/${id}`,
    delete: (id: string) => `/topics/${id}`
  },
  communities: {
    list: "/communities",
    detail: (id: string) => `/communities/${id}`,
    create: "/communities",
    update: (id: string) => `/communities/${id}`,
    delete: (id: string) => `/communities/${id}`,
    join: (id: string) => `/communities/${id}/join`,
    leave: (id: string) => `/communities/${id}/leave`
  },
  follows: {
    me: "/follows/me",
    followPolitician: (id: string) => `/follows/politicians/${id}`,
    unfollowPolitician: (id: string) => `/follows/politicians/${id}`,
    followUser: (id: string) => `/follows/users/${id}`,
    unfollowUser: (id: string) => `/follows/users/${id}`,
    followTopic: (id: string) => `/follows/topics/${id}`,
    unfollowTopic: (id: string) => `/follows/topics/${id}`
  },
  notifications: {
    byUser: (id: string) => `/notifications/user/${id}`,
    count: (id: string) => `/notifications/user/count/${id}`,
    detail: (id: string) => `/notifications/${id}`,
    create: "/notifications",
    markRead: (id: string) => `/notifications/${id}`,
    delete: (id: string) => `/notifications/delete/${id}`
  },
  media: {
    upload: "/media/upload",
    detail: (id: string) => `/media/${id}`,
    delete: (id: string) => `/media/${id}`
  },
  reports: {
    create: "/reports"
  },
  moderation: {
    action: "/moderation/action",
    reports: "/moderation/reports"
  },
  analytics: {
    overview: "/analytics/overview",
    dashboard: "/analytics/dashboard"
  },
  ai: {
    summarize: "/ai/summarize",
    sentiment: "/ai/sentiment",
    moderate: "/ai/moderate",
    promises: "/ai/extract-promises",
    translate: "/ai/translate",
    explain: "/ai/explain"
  },
  countries: {
    list: "/countries",
    multiRegion: "/countries/multi-region"
  },
  admin: {
    users: "/auth/users",
    user: (id: string) => `/auth/users/${id}`,
    suspendUser: (id: string) => `/auth/users/${id}/suspend`,
    reports: "/reports",
    moderation: "/moderation",
    analytics: "/analytics"
  }
} as const;
