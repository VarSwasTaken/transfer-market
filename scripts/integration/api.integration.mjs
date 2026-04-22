import { cleanupCreated, createCreatedTracker } from "./lib/cleanup.mjs";
import {
  EXISTING_SERVER_BASE_URL,
  FALLBACK_BASE_URL,
  isServerReady,
  startDevServer,
  waitForServer,
} from "./lib/runtime.mjs";
import { runCrudLifecycleSuite } from "./suites/crud-lifecycle.suite.mjs";
import { runSmokeAndGuardsSuite } from "./suites/smoke-and-guards.suite.mjs";

async function run() {
  let baseUrl = EXISTING_SERVER_BASE_URL;
  let server = null;
  const created = createCreatedTracker();
  const context = { baseUrl, created, baseline: null };

  try {
    const existingServerAvailable = await isServerReady(EXISTING_SERVER_BASE_URL);
    if (!existingServerAvailable) {
      baseUrl = FALLBACK_BASE_URL;
      server = startDevServer();
      await waitForServer(baseUrl);
    }
    context.baseUrl = baseUrl;

    await runSmokeAndGuardsSuite(context);
    await runCrudLifecycleSuite(context);

    console.log("Integration API tests passed.");
  } finally {
    await cleanupCreated(baseUrl, created);

    if (server && !server.killed) {
      server.kill("SIGTERM");
    }
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
