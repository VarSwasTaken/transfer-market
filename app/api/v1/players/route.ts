import { Position } from "@prisma/client";

import { getPlayersList } from "@/lib/services/players-list";

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
