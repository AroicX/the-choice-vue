import { endpoints } from "@/services/client/endpoints";
import { api, getData } from "@/services/client/api";
import { asArray } from "@/lib/content-utils";
import type { FollowRecord, Post, RoomRecord, User } from "@/types";

export const userQueries = {
  me: () => getData<User>(endpoints.users.me),
  profile: (id: string) => getData<User>(endpoints.users.profile(id)),
  posts: (id: string) => getData<Post[]>(endpoints.posts.byUser(id)),
  follows: () => getData<FollowRecord[]>(endpoints.follows.me),
  rooms: async () => {
    const response = await api.get(endpoints.rooms.me);
    return asArray<RoomRecord>(response.data);
  }
};
