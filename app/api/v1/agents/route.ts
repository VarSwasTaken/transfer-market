import { getAgentsList } from "@/lib/services/agents-list";
import { createAgent } from "@/lib/services/agents-write";

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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    if (typeof body.name !== "string") {
      return Response.json(
        { ok: false, error: "Invalid payload for agent creation." },
        { status: 400 },
      );
    }

    const created = await createAgent({
      name: body.name.trim(),
      agency: typeof body.agency === "string" ? body.agency : null,
    });

    return Response.json({ ok: true, data: created }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create agent.";
    return Response.json({ ok: false, error: message }, { status: 400 });
  }
}
