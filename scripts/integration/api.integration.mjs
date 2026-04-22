import assert from "node:assert/strict";
import { spawn } from "node:child_process";

const PORT = Number(process.env.INTEGRATION_TEST_PORT || 3011);
const FALLBACK_BASE_URL = `http://localhost:${PORT}`;
const EXISTING_SERVER_BASE_URL = process.env.INTEGRATION_TEST_BASE_URL || "http://localhost:3000";

function startDevServer() {
  const child = spawn(`npx next dev -p ${PORT}`, {
    cwd: process.cwd(),
    env: process.env,
    shell: true,
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (chunk) => {
    process.stdout.write(`[next] ${chunk}`);
  });

  child.stderr.on("data", (chunk) => {
    process.stderr.write(`[next:err] ${chunk}`);
  });

  return child;
}

async function waitForServer(url, timeoutMs = 90000) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(`${url}/api/v1/players?limit=1&page=1`);
      if (response.ok) {
        return;
      }
    } catch {
      // Server not ready yet.
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Server did not become ready within ${timeoutMs}ms.`);
}

async function isServerReady(url) {
  try {
    const response = await fetch(`${url}/api/v1/players?limit=1&page=1`);
    return response.ok;
  } catch {
    return false;
  }
}

async function callApi(baseUrl, path, init) {
  const response = await fetch(`${baseUrl}${path}`, init);
  const text = await response.text();
  const json = text ? JSON.parse(text) : {};
  return { response, json };
}

async function run() {
  let baseUrl = EXISTING_SERVER_BASE_URL;
  let server = null;
  let loanTransferId = null;
  let completedTransferId = null;

  try {
    const existingServerAvailable = await isServerReady(EXISTING_SERVER_BASE_URL);
    if (!existingServerAvailable) {
      baseUrl = FALLBACK_BASE_URL;
      server = startDevServer();
      await waitForServer(baseUrl);
    }

    const transfersList = await callApi(baseUrl, "/api/v1/transfers?page=1&limit=3");
    assert.equal(transfersList.response.status, 200, "GET /transfers should return 200");
    assert.equal(transfersList.json.ok, true, "GET /transfers should return ok=true");

    const contractsList = await callApi(baseUrl, "/api/v1/contracts?page=1&limit=3");
    assert.equal(contractsList.response.status, 200, "GET /contracts should return 200");
    assert.equal(contractsList.json.ok, true, "GET /contracts should return ok=true");

    const freeWithoutContract = await callApi(baseUrl, "/api/v1/transfers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerId: 62,
        toClubId: 11,
        fee: 0,
        transferType: "FREE",
        date: "2026-07-01",
      }),
    });
    assert.equal(
      freeWithoutContract.response.status,
      400,
      "FREE transfer without contract should return 400",
    );

    const loanWithoutEndDate = await callApi(baseUrl, "/api/v1/transfers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerId: 62,
        toClubId: 11,
        fee: 0,
        transferType: "LOAN",
        date: "2026-07-01",
      }),
    });
    assert.equal(
      loanWithoutEndDate.response.status,
      400,
      "LOAN transfer without loanEndDate should return 400",
    );

    const playerProfile = await callApi(baseUrl, "/api/v1/players/62");
    assert.equal(playerProfile.response.status, 200, "GET /players/62 should return 200");

    const fromClubId = playerProfile.json.data?.club?.id;
    assert.equal(typeof fromClubId, "number", "Player must have a club for LOAN test");

    const clubs = await callApi(baseUrl, "/api/v1/clubs?page=1&limit=100");
    assert.equal(clubs.response.status, 200, "GET /clubs should return 200");

    const toClub = (clubs.json.data || []).find((club) => club.id !== fromClubId);
    assert.ok(toClub, "Need a second club to run LOAN test");

    const createLoan = await callApi(baseUrl, "/api/v1/transfers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerId: 62,
        toClubId: toClub.id,
        fee: 0,
        transferType: "LOAN",
        loanEndDate: "2027-06-30",
        date: "2026-07-01",
      }),
    });

    assert.equal(createLoan.response.status, 201, "Creating LOAN transfer should return 201");
    assert.equal(createLoan.json.ok, true, "Creating LOAN transfer should return ok=true");

    loanTransferId = createLoan.json.data?.transfer?.id ?? null;
    assert.equal(typeof loanTransferId, "number", "LOAN transfer id should be present");
    assert.equal(
      createLoan.json.data?.transfer?.loanEndDate,
      "2027-06-30T00:00:00.000Z",
      "LOAN transfer should include loanEndDate",
    );

    const completeLoan = await callApi(baseUrl, `/api/v1/transfers/${loanTransferId}/complete-loan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ returnDate: "2027-06-30" }),
    });

    assert.equal(completeLoan.response.status, 201, "Completing LOAN should return 201");
    assert.equal(completeLoan.json.ok, true, "Completing LOAN should return ok=true");

    completedTransferId = completeLoan.json.data?.completedTransfer?.id ?? null;
    assert.equal(typeof completedTransferId, "number", "Completed transfer id should be present");

    const completeLoanAgain = await callApi(baseUrl, `/api/v1/transfers/${loanTransferId}/complete-loan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ returnDate: "2027-07-10" }),
    });

    assert.equal(completeLoanAgain.response.status, 409, "Second completion should return 409");

    const invalidContract = await callApi(baseUrl, "/api/v1/contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerId: 62,
        startDate: "2028-06-30",
        endDate: "2027-06-30",
        salary: 1000000,
      }),
    });

    assert.equal(invalidContract.response.status, 400, "Invalid contract dates should return 400");

    console.log("Integration API tests passed.");
  } finally {
    if (completedTransferId) {
      try {
        await callApi(baseUrl, `/api/v1/transfers/${completedTransferId}`, { method: "DELETE" });
      } catch {
        // Best-effort cleanup.
      }
    }

    if (loanTransferId) {
      try {
        await callApi(baseUrl, `/api/v1/transfers/${loanTransferId}`, { method: "DELETE" });
      } catch {
        // Best-effort cleanup.
      }
    }

    if (server && !server.killed) {
      server.kill("SIGTERM");
    }
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
