import { endpoints } from "@/services/client/endpoints";
import { getData } from "@/services/client/api";
import type { Issue, Politician, Poll, Post } from "@/types";

export const civicQueries = {
  feed: (type: "home" | "trending" | "following" | "local" = "home") =>
    getData<Post[]>(endpoints.feed[type]),
  discussions: () => getData(endpoints.discussions.list),
  issues: () => getData<Issue[]>(endpoints.issues.list),
  politicians: () => getData<Politician[]>(endpoints.politicians.list),
  polls: () => getData<Poll[]>(endpoints.polls.list),
  elections: () => getData(endpoints.elections.list),
  ratings: () => getData(endpoints.ratings.list),
  news: () => getData(endpoints.news.list),
  factChecks: () => getData(endpoints.factChecks.list)
};
