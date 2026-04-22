import { Position } from "@prisma/client";

import { getPlayersList } from "@/lib/services/players-list";
import { createPlayer } from "@/lib/services/players-write";

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

function parseSortBy(value: string | null): "marketValue" | "lastName" | "createdAt" {
  if (value === "marketValue" || value === "createdAt") {
    return value;
  }
  return "lastName";
}

function parseSortOrder(value: string | null): "asc" | "desc" {
  if (value === "asc") {
    return "asc";
  }
  return "desc";
}

function parsePosition(value: string | null): Position | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.toUpperCase();
  if (normalized in Position) {
    return Position[normalized as keyof typeof Position];
  }

  return undefined;
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  const page = parsePositiveInt(url.searchParams.get("page")) ?? 1;
  const limit = parsePositiveInt(url.searchParams.get("limit")) ?? 20;

  const clubId = parsePositiveInt(url.searchParams.get("clubId")) ?? undefined;
  const leagueId = parsePositiveInt(url.searchParams.get("leagueId")) ?? undefined;
  const nationalityId =
    parsePositiveInt(url.searchParams.get("nationalityId")) ?? undefined;

  const result = await getPlayersList({
    page,
    limit,
    search: url.searchParams.get("search")?.trim() || undefined,
    position: parsePosition(url.searchParams.get("position")),
    clubId,
    leagueId,
    nationalityId,
    sortBy: parseSortBy(url.searchParams.get("sortBy")),
    sortOrder: parseSortOrder(url.searchParams.get("sortOrder")),
  });

  return Response.json({
    ok: true,
    data: result.data,
    meta: result.meta,
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    if (
      typeof body.firstName !== "string" ||
      typeof body.lastName !== "string" ||
      typeof body.birthDate !== "string" ||
      typeof body.position !== "string" ||
      (typeof body.marketValue !== "string" && typeof body.marketValue !== "number") ||
      typeof body.nationalityId !== "number"
    ) {
      return Response.json(
        { ok: false, error: "Invalid payload for player creation." },
        { status: 400 },
      );
    }

    const normalizedPosition = body.position.toUpperCase();
    if (!(normalizedPosition in Position)) {
      return Response.json(
        { ok: false, error: "Invalid position value." },
        { status: 400 },
      );
    }

    const created = await createPlayer({
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      birthDate: body.birthDate,
      position: Position[normalizedPosition as keyof typeof Position],
      preferredFoot:
        body.preferredFoot === "LEFT" ||
        body.preferredFoot === "RIGHT" ||
        body.preferredFoot === "BOTH"
          ? body.preferredFoot
          : undefined,
      marketValue: body.marketValue,
      nationalityId: body.nationalityId,
      clubId: typeof body.clubId === "number" ? body.clubId : null,
      agentId: typeof body.agentId === "number" ? body.agentId : null,
      height: typeof body.height === "number" ? body.height : null,
      weight: typeof body.weight === "number" ? body.weight : null,
      imageUrl: typeof body.imageUrl === "string" ? body.imageUrl : null,
    });

    return Response.json({ ok: true, data: created }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create player.";
    return Response.json({ ok: false, error: message }, { status: 400 });
  }
}
