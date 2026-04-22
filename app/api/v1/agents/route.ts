import { getAgentsList } from "@/lib/services/agents-list";

export const runtime = "nodejs";

function parsePositiveInt(value: string | null, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : defaultValue;
}

function parseSortBy(value: string | null): "name" | "createdAt" {
  return value === "createdAt" ? "createdAt" : "name";
}

function parseSortOrder(value: string | null): "asc" | "desc" {
  return value === "desc" ? "desc" : "asc";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const page = parsePositiveInt(searchParams.get("page"), 1);
  const limit = parsePositiveInt(searchParams.get("limit"), 20);
  const search = searchParams.get("search") || undefined;
  const sortBy = parseSortBy(searchParams.get("sortBy"));
  const sortOrder = parseSortOrder(searchParams.get("sortOrder"));

  const { items, total } = await getAgentsList({
    page,
    limit,
    search,
    sortBy,
    sortOrder,
  });

  const totalPages = Math.ceil(total / limit);

  return Response.json({
    ok: true,
    data: items,
    meta: {
      page,
      limit,
      totalItems: total,
      totalPages,
    },
  });
}
