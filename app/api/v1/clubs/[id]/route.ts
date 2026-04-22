import { getClubProfile } from "@/lib/services/club-profile";
import { deleteClub, updateClub } from "@/lib/services/clubs-write";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const clubId = Number(id);

  if (!Number.isInteger(clubId) || clubId <= 0) {
    return Response.json(
      {
        ok: false,
        error: "Invalid club id.",
      },
      {
        status: 400,
      },
    );
  }

  const profile = await getClubProfile(clubId);

  if (!profile.data) {
    return Response.json(
      {
        ok: false,
        error: "Club not found.",
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
  const clubId = Number(id);

  if (!Number.isInteger(clubId) || clubId <= 0) {
    return Response.json(
      {
        ok: false,
        error: "Invalid club id.",
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
    if (typeof body.budget === "string" || typeof body.budget === "number") {
      payload.budget = body.budget;
    }
    if (typeof body.leagueId === "number") payload.leagueId = body.leagueId;
    if (typeof body.logoUrl === "string" || body.logoUrl === null) payload.logoUrl = body.logoUrl;

    const updated = await updateClub(clubId, payload);

    if (!updated) {
      return Response.json({ ok: false, error: "Club not found." }, { status: 404 });
    }

    return Response.json({ ok: true, data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update club.";
    return Response.json({ ok: false, error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const clubId = Number(id);

  if (!Number.isInteger(clubId) || clubId <= 0) {
    return Response.json({ ok: false, error: "Invalid club id." }, { status: 400 });
  }

  try {
    const deleted = await deleteClub(clubId);

    if (!deleted) {
      return Response.json({ ok: false, error: "Club not found." }, { status: 404 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete club.";
    return Response.json({ ok: false, error: message }, { status: 409 });
  }
}
