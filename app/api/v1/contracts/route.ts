import { getContractsList } from "@/lib/services/contracts-list";
import { createContract } from "@/lib/services/contracts-write";

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

  return Response.json({ ok: true, data: result.data, meta: result.meta });
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
      return Response.json(
        { ok: false, error: "Invalid payload for contract creation." },
        { status: 400 },
      );
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

    return Response.json({ ok: true, data: created }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create contract.";
    return Response.json({ ok: false, error: message }, { status: 400 });
  }
}
