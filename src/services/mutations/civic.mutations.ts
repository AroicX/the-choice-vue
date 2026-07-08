import { api } from "@/services/client/api";
import { endpoints } from "@/services/client/endpoints";

export async function createIssueMutation(input: Record<string, unknown>) {
  const response = await api.post(endpoints.issues.create, input);
  return response.data;
}

export async function votePollMutation(input: { pollId: string; value: string }) {
  const response = await api.patch(endpoints.polls.vote(input.pollId), { value: input.value });
  return response.data;
}

export async function upvoteIssueMutation(issueId: string) {
  const response = await api.post(endpoints.issues.upvote(issueId));
  return response.data;
}
