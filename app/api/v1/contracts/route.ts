import { getContractsList } from "@/lib/services/contracts-list";
import { createContract } from "@/lib/services/contracts-write";
import { badRequest, createdResponse, successResponse } from "@/lib/http/api-response";

export const runtime = "nodejs";

function parsePositiveInt(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  const page = parsePositiveInt(url.searchParams.get("page")) ?? 1;
  const limit = parsePositiveInt(url.searchParams.get("limit")) ?? 20;

  const playerId = parsePositiveInt(url.searchParams.get("playerId")) ?? undefined;

  const result = await getContractsList({
    page,
    limit,
    playerId,
  });

  return successResponse({ data: result.data, meta: result.meta });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    if (
      typeof body.playerId !== "number" ||
      typeof body.startDate !== "string" ||
      typeof body.endDate !== "string" ||
      (typeof body.salary !== "string" && typeof body.salary !== "number")
    ) {
      return badRequest("Invalid payload for contract creation.");
    }

    const created = await createContract({
      playerId: body.playerId,
      startDate: body.startDate,
      endDate: body.endDate,
      salary: body.salary,
      releaseClause:
        typeof body.releaseClause === "string" ||
        typeof body.releaseClause === "number" ||
        body.releaseClause === null
          ? body.releaseClause
          : undefined,
    });

    return createdResponse({ data: created });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create contract.";
    return badRequest(message);
  }
}
