import { badRequest, createdResponse, successResponse } from "@/lib/http/api-response";
import { createScoutReport, listScoutReports } from "@/lib/services/scout-reports";

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
  const scoutName = url.searchParams.get("scoutName")?.trim() || undefined;

  const playerId = playerIdParam ? Number(playerIdParam) : undefined;

  if (playerIdParam && (!Number.isInteger(playerId) || Number(playerId) <= 0)) {
    return badRequest("Invalid playerId filter.");
  }

  const { items, total } = await listScoutReports({
    page,
    limit,
    playerId,
    scoutName,
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

    if (typeof body.playerId !== "number" || typeof body.scoutName !== "string") {
      return badRequest("Invalid payload for scouting report creation.");
    }

    const created = await createScoutReport({
      playerId: body.playerId,
      scoutName: body.scoutName,
      date: typeof body.date === "string" ? body.date : undefined,
      rating: typeof body.rating === "number" ? body.rating : undefined,
      potential:
        typeof body.potential === "string"
          ? (body.potential as "Low" | "Medium" | "High" | "World Class")
          : undefined,
      pros: Array.isArray(body.pros) ? body.pros.filter((item): item is string => typeof item === "string") : undefined,
      cons: Array.isArray(body.cons) ? body.cons.filter((item): item is string => typeof item === "string") : undefined,
      notes: typeof body.notes === "string" ? body.notes : null,
      attributes:
        typeof body.attributes === "object" && body.attributes !== null
          ? (body.attributes as {
              pace?: number;
              shooting?: number;
              passing?: number;
              dribbling?: number;
              defending?: number;
              physical?: number;
            })
          : undefined,
    });

    return createdResponse({ data: created });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create scouting report.";
    return badRequest(message);
  }
}
