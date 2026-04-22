import { getClubsList } from "@/lib/services/clubs-list";

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

function parseSortBy(value: string | null): "name" | "budget" | "createdAt" {
  if (value === "budget" || value === "createdAt") {
    return value;
  }
  return "name";
}

function parseSortOrder(value: string | null): "asc" | "desc" {
  if (value === "asc") {
    return "asc";
  }
  return "desc";
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  const result = await getClubsList({
    page: parsePositiveInt(url.searchParams.get("page")) ?? 1,
    limit: parsePositiveInt(url.searchParams.get("limit")) ?? 20,
    search: url.searchParams.get("search")?.trim() || undefined,
    leagueId: parsePositiveInt(url.searchParams.get("leagueId")) ?? undefined,
    nationalityId:
      parsePositiveInt(url.searchParams.get("nationalityId")) ?? undefined,
    sortBy: parseSortBy(url.searchParams.get("sortBy")),
    sortOrder: parseSortOrder(url.searchParams.get("sortOrder")),
  });

  return Response.json({
    ok: true,
    data: result.data,
    meta: result.meta,
  });
}
