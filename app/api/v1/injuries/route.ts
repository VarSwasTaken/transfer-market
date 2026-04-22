import { badRequest, createdResponse, successResponse } from "@/lib/http/api-response";
import { createInjury, listInjuries } from "@/lib/services/injuries";

export const runtime = "nodejs";

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  const page = parsePositiveInt(url.searchParams.get("page"), 1);
  const limit = parsePositiveInt(url.searchParams.get("limit"), 20);
  const playerIdParam = url.searchParams.get("playerId");
  const statusParam = url.searchParams.get("status");

  const playerId = playerIdParam ? Number(playerIdParam) : undefined;

  if (playerIdParam && (!Number.isInteger(playerId) || Number(playerId) <= 0)) {
    return badRequest("Invalid playerId filter.");
  }

  const { items, total } = await listInjuries({
    page,
    limit,
    playerId,
    status: statusParam
      ? (statusParam as "W trakcie leczenia" | "Rehabilitacja" | "Wyleczona")
      : undefined,
  });

  return successResponse({
    data: items,
    meta: {
      page,
      limit,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    if (
      typeof body.playerId !== "number" ||
      typeof body.type !== "string" ||
      typeof body.severity !== "string" ||
      typeof body.startDate !== "string"
    ) {
      return badRequest("Invalid payload for injury creation.");
    }

    const created = await createInjury({
      playerId: body.playerId,
      type: body.type,
      severity: body.severity as "Lekka" | "Średnia" | "Poważna" | "Krytyczna",
      startDate: body.startDate,
      expectedReturnDate:
        typeof body.expectedReturnDate === "string" ? body.expectedReturnDate : null,
      actualReturnDate:
        typeof body.actualReturnDate === "string" ? body.actualReturnDate : null,
      status: typeof body.status === "string" ? (body.status as "W trakcie leczenia" | "Rehabilitacja" | "Wyleczona") : undefined,
      description: typeof body.description === "string" ? body.description : null,
      treatment: typeof body.treatment === "string" ? body.treatment : null,
      reportedBy: typeof body.reportedBy === "string" ? body.reportedBy : null,
    });

    return createdResponse({ data: created });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create injury.";
    return badRequest(message);
  }
}
