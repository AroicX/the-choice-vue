export const queryKeys = {
  me: ["me"],
  home: ["home"],
  feed: (type: string) => ["feed", type],
  discussions: ["discussions"],
  issues: ["issues"],
  politicians: ["politicians"],
  polls: ["polls"],
  elections: ["elections"],
  ratings: ["ratings"],
  news: ["news"],
  factChecks: ["fact-checks"],
  control: (resource: string) => ["control", resource]
} as const;
