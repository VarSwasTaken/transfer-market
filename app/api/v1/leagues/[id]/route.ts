import { getLeagueProfile } from "@/lib/services/league-profile";
import { deleteLeague, updateLeague } from "@/lib/services/leagues-write";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const leagueId = Number(id);

  if (!Number.isInteger(leagueId) || leagueId <= 0) {
    return Response.json(
      {
        ok: false,
        error: "Invalid league id.",
      },
      {
        status: 400,
      },
    );
  }

  const profile = await getLeagueProfile(leagueId);

  if (!profile.data) {
    return Response.json(
      {
        ok: false,
        error: "League not found.",
        warnings: profile.warnings,
      },
      {
        status: 404,
      },
    );
  }

  return Response.json({
    ok: true,
    data: profile.data,
    warnings: profile.warnings,
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const leagueId = Number(id);

  if (!Number.isInteger(leagueId) || leagueId <= 0) {
    return Response.json(
      {
        ok: false,
        error: "Invalid league id.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const payload: Record<string, unknown> = {};

    if (typeof body.name === "string") payload.name = body.name.trim();
    if (typeof body.nationalityId === "number") payload.nationalityId = body.nationalityId;
    if (typeof body.logoUrl === "string" || body.logoUrl === null) payload.logoUrl = body.logoUrl;

    const updated = await updateLeague(leagueId, payload);

    if (!updated) {
      return Response.json({ ok: false, error: "League not found." }, { status: 404 });
    }

    return Response.json({ ok: true, data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update league.";
    return Response.json({ ok: false, error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const leagueId = Number(id);

  if (!Number.isInteger(leagueId) || leagueId <= 0) {
    return Response.json({ ok: false, error: "Invalid league id." }, { status: 400 });
  }

  try {
    const deleted = await deleteLeague(leagueId);

    if (!deleted) {
      return Response.json({ ok: false, error: "League not found." }, { status: 404 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete league.";
    return Response.json({ ok: false, error: message }, { status: 409 });
  }
}
