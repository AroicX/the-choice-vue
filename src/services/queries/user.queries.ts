import { endpoints } from "@/services/client/endpoints";
import { api, getData } from "@/services/client/api";
import { asArray } from "@/lib/content-utils";
import type { FollowRecord, Post, RoomRecord, User } from "@/types";

export type PublicActivityPage<T> = {
  items: T[];
  total: number;
  take: number;
  skip: number;
};

function unwrapActivityPage<T>(payload: unknown): PublicActivityPage<T> {
  if (payload && typeof payload === "object" && "items" in payload) {
    const page = payload as PublicActivityPage<T>;
    return {
      items: asArray<T>(page.items),
      total: Number(page.total ?? 0),
      take: Number(page.take ?? 24),
      skip: Number(page.skip ?? 0)
    };
  }
  const items = asArray<T>(payload);
  return { items, total: items.length, take: items.length, skip: 0 };
}

export const userQueries = {
  me: () => getData<User>(endpoints.users.me),
  profile: (id: string) => getData<User>(endpoints.users.profile(id)),
  publicProfile: (identifier: string) => getData<User>(endpoints.users.public(identifier)),
  posts: (id: string) => getData<Post[]>(endpoints.posts.byUser(id)),
  publicPosts: async (identifier: string, take = 24, skip = 0) =>
    unwrapActivityPage(
      await getData(endpoints.users.publicPosts(identifier), { take, skip })
    ),
  publicComments: async (identifier: string, take = 24, skip = 0) =>
    unwrapActivityPage(
      await getData(endpoints.users.publicComments(identifier), { take, skip })
    ),
  publicMedia: async (identifier: string, take = 36, skip = 0) =>
    unwrapActivityPage(
      await getData(endpoints.users.publicMedia(identifier), { take, skip })
    ),
  publicLikes: async (identifier: string, take = 24, skip = 0) =>
    unwrapActivityPage(
      await getData(endpoints.users.publicLikes(identifier), { take, skip })
    ),
  publicVotes: async (identifier: string, take = 24, skip = 0) =>
    unwrapActivityPage(
      await getData(endpoints.users.publicVotes(identifier), { take, skip })
    ),
  publicIssues: async (identifier: string, take = 24, skip = 0) =>
    unwrapActivityPage(
      await getData(endpoints.users.publicIssues(identifier), { take, skip })
    ),
  follows: () => getData<FollowRecord[]>(endpoints.follows.me),
  rooms: async () => {
    const response = await api.get(endpoints.rooms.me);
    return asArray<RoomRecord>(response.data);
  }
};
