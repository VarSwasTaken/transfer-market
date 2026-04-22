import { spawn } from "node:child_process";

export const PORT = Number(process.env.INTEGRATION_TEST_PORT || 3011);
export const FALLBACK_BASE_URL = `http://localhost:${PORT}`;
export const EXISTING_SERVER_BASE_URL =
  process.env.INTEGRATION_TEST_BASE_URL || "http://localhost:3000";

export function startDevServer() {
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

export async function waitForServer(url, timeoutMs = 90000) {
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

export async function isServerReady(url) {
  try {
    const response = await fetch(`${url}/api/v1/players?limit=1&page=1`);
    return response.ok;
  } catch {
    return false;
  }
}

export async function callApi(baseUrl, path, init) {
  const response = await fetch(`${baseUrl}${path}`, init);
  const text = await response.text();
  const json = text ? JSON.parse(text) : {};
  return { response, json };
}

export function uniqueName(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}
