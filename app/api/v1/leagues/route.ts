import { getLeaguesList } from "@/lib/services/leagues-list";
import { createLeague } from "@/lib/services/leagues-write";

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

function parseSortBy(value: string | null): "name" | "createdAt" {
  if (value === "createdAt") {
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

  const result = await getLeaguesList({
    page: parsePositiveInt(url.searchParams.get("page")) ?? 1,
    limit: parsePositiveInt(url.searchParams.get("limit")) ?? 20,
    search: url.searchParams.get("search")?.trim() || undefined,
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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    if (typeof body.name !== "string" || typeof body.nationalityId !== "number") {
      return Response.json(
        { ok: false, error: "Invalid payload for league creation." },
        { status: 400 },
      );
    }

    const created = await createLeague({
      name: body.name.trim(),
      nationalityId: body.nationalityId,
      logoUrl: typeof body.logoUrl === "string" ? body.logoUrl : null,
    });

    return Response.json({ ok: true, data: created }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create league.";
    return Response.json({ ok: false, error: message }, { status: 400 });
  }
}
