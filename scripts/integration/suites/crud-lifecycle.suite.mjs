import assert from "node:assert/strict";
import { callApi, uniqueName } from "../lib/runtime.mjs";

export async function runCrudLifecycleSuite(context) {
  const { baseUrl, created, baseline } = context;
  assert.ok(baseline, "Baseline context must be prepared before CRUD suite");

  const createAgent = await callApi(baseUrl, "/api/v1/agents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: uniqueName("it-agent"),
      agency: "IT Agency",
    }),
  });
  assert.equal(createAgent.response.status, 201, "POST /agents should return 201");
  const agentId = createAgent.json.data?.id;
  assert.equal(typeof agentId, "number", "Created agent id should be a number");
  created.agents.push(agentId);

  const patchAgent = await callApi(baseUrl, `/api/v1/agents/${agentId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agency: "IT Agency Updated" }),
  });
  assert.equal(patchAgent.response.status, 200, "PATCH /agents/:id should return 200");

  const getAgent = await callApi(baseUrl, `/api/v1/agents/${agentId}`);
  assert.equal(getAgent.response.status, 200, "GET /agents/:id should return 200");

  const createLeague = await callApi(baseUrl, "/api/v1/leagues", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: uniqueName("it-league"),
      nationalityId: baseline.nationalityId,
    }),
  });
  assert.equal(createLeague.response.status, 201, "POST /leagues should return 201");
  const leagueId = createLeague.json.data?.id;
  assert.equal(typeof leagueId, "number", "Created league id should be a number");
  created.leagues.push(leagueId);

  const patchLeague = await callApi(baseUrl, `/api/v1/leagues/${leagueId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ logoUrl: "https://example.com/league.png" }),
  });
  assert.equal(patchLeague.response.status, 200, "PATCH /leagues/:id should return 200");

  const createClub = await callApi(baseUrl, "/api/v1/clubs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: uniqueName("it-club"), budget: "50000000", leagueId }),
  });
  assert.equal(createClub.response.status, 201, "POST /clubs should return 201");
  const clubId = createClub.json.data?.id;
  assert.equal(typeof clubId, "number", "Created club id should be a number");
  created.clubs.push(clubId);

  const patchClub = await callApi(baseUrl, `/api/v1/clubs/${clubId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ budget: "60000000" }),
  });
  assert.equal(patchClub.response.status, 200, "PATCH /clubs/:id should return 200");

  const getClub = await callApi(baseUrl, `/api/v1/clubs/${clubId}`);
  assert.equal(getClub.response.status, 200, "GET /clubs/:id should return 200");

  const deleteLeagueWithClub = await callApi(baseUrl, `/api/v1/leagues/${leagueId}`, {
    method: "DELETE",
  });
  assert.equal(deleteLeagueWithClub.response.status, 409, "Deleting league with clubs should return 409");

  const createPlayer = await callApi(baseUrl, "/api/v1/players", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstName: "IT",
      lastName: uniqueName("Player"),
      birthDate: "2000-01-01",
      position: "MIDFIELDER",
      marketValue: "2500000",
      nationalityId: baseline.nationalityId,
      clubId,
      agentId,
    }),
  });
  assert.equal(createPlayer.response.status, 201, "POST /players should return 201");
  const playerId = createPlayer.json.data?.id;
  assert.equal(typeof playerId, "number", "Created player id should be a number");
  created.players.push(playerId);

  const patchPlayer = await callApi(baseUrl, `/api/v1/players/${playerId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ weight: 78 }),
  });
  assert.equal(patchPlayer.response.status, 200, "PATCH /players/:id should return 200");

  const getPlayer = await callApi(baseUrl, `/api/v1/players/${playerId}`);
  assert.equal(getPlayer.response.status, 200, "GET /players/:id should return 200");

  const createInvalidContract = await callApi(baseUrl, "/api/v1/contracts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      playerId,
      startDate: "2028-01-01",
      endDate: "2027-01-01",
      salary: 1000000,
    }),
  });
  assert.equal(createInvalidContract.response.status, 400, "Invalid contract dates should return 400");

  const createContract = await callApi(baseUrl, "/api/v1/contracts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      playerId,
      startDate: "2027-01-01",
      endDate: "2028-01-01",
      salary: 1000000,
    }),
  });
  assert.equal(createContract.response.status, 201, "POST /contracts should return 201");
  const contractId = createContract.json.data?.id;
  assert.equal(typeof contractId, "number", "Created contract id should be a number");
  created.contracts.push(contractId);

  const patchContract = await callApi(baseUrl, `/api/v1/contracts/${contractId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ salary: 1200000 }),
  });
  assert.equal(patchContract.response.status, 200, "PATCH /contracts/:id should return 200");

  const getContract = await callApi(baseUrl, `/api/v1/contracts/${contractId}`);
  assert.equal(getContract.response.status, 200, "GET /contracts/:id should return 200");

  const freeWithoutContract = await callApi(baseUrl, "/api/v1/transfers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      playerId: baseline.playerId,
      toClubId: baseline.clubId,
      fee: 0,
      transferType: "FREE",
      date: "2026-07-01",
    }),
  });
  assert.equal(freeWithoutContract.response.status, 400, "FREE without contract should return 400");

  const loanWithoutEndDate = await callApi(baseUrl, "/api/v1/transfers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      playerId: baseline.playerId,
      toClubId: baseline.clubId,
      fee: 0,
      transferType: "LOAN",
      date: "2026-07-01",
    }),
  });
  assert.equal(loanWithoutEndDate.response.status, 400, "LOAN without loanEndDate should return 400");

  const createLoan = await callApi(baseUrl, "/api/v1/transfers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      playerId,
      toClubId: baseline.clubId,
      fee: 0,
      transferType: "LOAN",
      loanEndDate: "2027-06-30",
      date: "2026-07-01",
    }),
  });
  assert.equal(createLoan.response.status, 201, "POST /transfers LOAN should return 201");
  const loanTransferId = createLoan.json.data?.transfer?.id;
  assert.equal(typeof loanTransferId, "number", "Created loan transfer id should be a number");
  created.transfers.push(loanTransferId);

  const getTransfer = await callApi(baseUrl, `/api/v1/transfers/${loanTransferId}`);
  assert.equal(getTransfer.response.status, 200, "GET /transfers/:id should return 200");

  const patchTransfer = await callApi(baseUrl, `/api/v1/transfers/${loanTransferId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date: "2026-07-02" }),
  });
  assert.equal(patchTransfer.response.status, 200, "PATCH /transfers/:id should return 200");

  const completeLoan = await callApi(baseUrl, `/api/v1/transfers/${loanTransferId}/complete-loan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ returnDate: "2027-06-30" }),
  });
  assert.equal(completeLoan.response.status, 201, "Complete LOAN should return 201");
  const completedTransferId = completeLoan.json.data?.completedTransfer?.id;
  assert.equal(typeof completedTransferId, "number", "Completed transfer id should be a number");
  created.transfers.push(completedTransferId);

  const completeLoanAgain = await callApi(baseUrl, `/api/v1/transfers/${loanTransferId}/complete-loan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ returnDate: "2027-07-10" }),
  });
  assert.equal(completeLoanAgain.response.status, 409, "Second complete-loan should return 409");

  const deleteContract = await callApi(baseUrl, `/api/v1/contracts/${contractId}`, {
    method: "DELETE",
  });
  assert.equal(deleteContract.response.status, 200, "DELETE /contracts/:id should return 200");
  created.contracts = created.contracts.filter((id) => id !== contractId);

  const deletePlayerWithTransfers = await callApi(baseUrl, `/api/v1/players/${playerId}`, {
    method: "DELETE",
  });
  assert.equal(deletePlayerWithTransfers.response.status, 409, "Player with transfers should return 409");

  for (const id of [...created.transfers].reverse()) {
    const deleteTransfer = await callApi(baseUrl, `/api/v1/transfers/${id}`, { method: "DELETE" });
    assert.equal(deleteTransfer.response.status, 200, `DELETE /transfers/${id} should return 200`);
    created.transfers = created.transfers.filter((transferIdValue) => transferIdValue !== id);
  }

  const deletePlayer = await callApi(baseUrl, `/api/v1/players/${playerId}`, { method: "DELETE" });
  assert.equal(deletePlayer.response.status, 200, "DELETE /players/:id should return 200");
  created.players = created.players.filter((id) => id !== playerId);

  const deleteClub = await callApi(baseUrl, `/api/v1/clubs/${clubId}`, { method: "DELETE" });
  assert.equal(deleteClub.response.status, 200, "DELETE /clubs/:id should return 200");
  created.clubs = created.clubs.filter((id) => id !== clubId);

  const deleteLeague = await callApi(baseUrl, `/api/v1/leagues/${leagueId}`, { method: "DELETE" });
  assert.equal(deleteLeague.response.status, 200, "DELETE /leagues/:id should return 200");
  created.leagues = created.leagues.filter((id) => id !== leagueId);

  const deleteAgent = await callApi(baseUrl, `/api/v1/agents/${agentId}`, { method: "DELETE" });
  assert.equal(deleteAgent.response.status, 200, "DELETE /agents/:id should return 200");
  created.agents = created.agents.filter((id) => id !== agentId);
}
