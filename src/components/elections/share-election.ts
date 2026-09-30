import { electionPhase } from "@/lib/content-utils";
import type { SharePayload } from "@/stores/share-modal-store";
import type { Election } from "@/types";

const STATUS = { live: "Mock election · Voting now", upcoming: "Mock election · Voting opens soon", closed: "Mock election · Results are in" };

/** Share-sheet payload for an election: title, status and candidates. */
export function electionSharePayload(election: Election): SharePayload {
  return {
    type: "election",
    url: `${window.location.origin}/elections/${election.id}`,
    author: "Choice9ja",
    message: election.title,
    status: STATUS[electionPhase(election.status)],
    candidates: election.options.map((option) => ({ label: option.label, image: option.image }))
  };
}
