import { callApi } from "./runtime.mjs";

export function createCreatedTracker() {
  return {
    agents: [],
    leagues: [],
    clubs: [],
    players: [],
    contracts: [],
    transfers: [],
  };
}

export async function cleanupCreated(baseUrl, created) {
  const ordered = [
    ["contracts", "contracts"],
    ["transfers", "transfers"],
    ["players", "players"],
    ["clubs", "clubs"],
    ["leagues", "leagues"],
    ["agents", "agents"],
  ];

  for (const [key, route] of ordered) {
    for (const id of [...created[key]].reverse()) {
      try {
        await callApi(baseUrl, `/api/v1/${route}/${id}`, { method: "DELETE" });
      } catch {
        // Best-effort cleanup.
      }
    }
  }
}
