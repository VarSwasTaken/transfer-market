import assert from "node:assert/strict";
import { callApi } from "../lib/runtime.mjs";

export async function runSmokeAndGuardsSuite(context) {
  const { baseUrl } = context;

  const smokeEndpoints = [
    "/api/v1/agents?page=1&limit=5",
    "/api/v1/clubs?page=1&limit=5",
    "/api/v1/leagues?page=1&limit=5",
    "/api/v1/players?page=1&limit=5",
    "/api/v1/transfers?page=1&limit=5",
    "/api/v1/contracts?page=1&limit=5",
    "/api/v1/injuries?page=1&limit=5",
    "/api/v1/scout-reports?page=1&limit=5",
  ];

  for (const endpoint of smokeEndpoints) {
    const result = await callApi(baseUrl, endpoint);
    assert.equal(result.response.status, 200, `GET ${endpoint} should return 200`);
    assert.equal(result.json.ok, true, `GET ${endpoint} should return ok=true`);
  }

  const playersList = await callApi(baseUrl, "/api/v1/players?page=1&limit=50");
  assert.equal(playersList.response.status, 200, "GET /players should return 200");

  const baselinePlayer = (playersList.json.data || []).find(
    (player) =>
      typeof player.id === "number" &&
      typeof player?.club?.id === "number" &&
      typeof player?.nationality?.id === "number",
  );
  assert.ok(baselinePlayer, "Need a player with club and nationality for integration tests");

  const baselinePlayerId = baselinePlayer.id;
  const baselineNationalityId = baselinePlayer.nationality.id;
  const baselineClubId = baselinePlayer.club.id;

  const baselinePlayerProfile = await callApi(baseUrl, `/api/v1/players/${baselinePlayerId}`);
  assert.equal(baselinePlayerProfile.response.status, 200, "GET /players/:id should return 200");

  const protectedAgentId = baselinePlayerProfile.json.data?.agent?.id;
  const protectedLeagueId = baselinePlayerProfile.json.data?.club?.league?.id;
  assert.equal(typeof protectedLeagueId, "number", "Need protected league id from baseline player");

  if (typeof protectedAgentId === "number") {
    const protectedAgentDelete = await callApi(baseUrl, `/api/v1/agents/${protectedAgentId}`, {
      method: "DELETE",
    });
    assert.equal(protectedAgentDelete.response.status, 409, "Deleting linked agent should return 409");
    assert.equal(
      typeof protectedAgentDelete.json.dependencies?.players,
      "number",
      "Agent conflict should expose dependencies.players",
    );
  }

  const protectedClubDelete = await callApi(baseUrl, `/api/v1/clubs/${baselineClubId}`, {
    method: "DELETE",
  });
  assert.equal(protectedClubDelete.response.status, 409, "Deleting linked club should return 409");
  assert.equal(
    typeof protectedClubDelete.json.dependencies?.players,
    "number",
    "Club conflict should expose dependencies.players",
  );

  const protectedLeagueDelete = await callApi(baseUrl, `/api/v1/leagues/${protectedLeagueId}`, {
    method: "DELETE",
  });
  assert.equal(protectedLeagueDelete.response.status, 409, "Deleting linked league should return 409");
  assert.equal(
    typeof protectedLeagueDelete.json.dependencies?.clubs,
    "number",
    "League conflict should expose dependencies.clubs",
  );

  const protectedPlayerDelete = await callApi(baseUrl, `/api/v1/players/${baselinePlayerId}`, {
    method: "DELETE",
  });
  assert.equal(protectedPlayerDelete.response.status, 409, "Deleting linked player should return 409");
  assert.equal(
    typeof protectedPlayerDelete.json.dependencies?.contracts,
    "number",
    "Player conflict should expose dependencies.contracts",
  );

  context.baseline = {
    playerId: baselinePlayerId,
    nationalityId: baselineNationalityId,
    clubId: baselineClubId,
  };
}
