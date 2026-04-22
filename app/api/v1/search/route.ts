import { getGlobalSearch, SearchType } from "@/lib/services/global-search";

export const runtime = "nodejs";

const MAX_LIMIT = 20;

function parseType(value: string | null): SearchType {
  if (value === "players" || value === "clubs" || value === "leagues" || value === "agents") {
    return value;
  }
  return "all";
}

function parseLimit(value: string | null): number {
  if (!value) {
    return 5;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return 5;
  }

  return Math.min(parsed, MAX_LIMIT);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("query")?.trim() || "";

  if (query.length < 2) {
    return Response.json(
      {
        ok: false,
        error: "Query must have at least 2 characters.",
      },
      { status: 400 },
    );
  }

  const type = parseType(url.searchParams.get("type"));
  const limit = parseLimit(url.searchParams.get("limit"));

  const results = await getGlobalSearch({
    query,
    type,
    limit,
  });

  return Response.json({
    ok: true,
    data: results,
    meta: {
      query,
      type,
      limit,
    },
  });
}
