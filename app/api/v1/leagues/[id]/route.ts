import { getLeagueProfile } from "@/lib/services/league-profile";
import { deleteLeague, updateLeague } from "@/lib/services/leagues-write";
import { badRequest, conflict, notFound, successResponse } from "@/lib/http/api-response";

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
    return badRequest("Invalid league id.");
  }

  const profile = await getLeagueProfile(leagueId);

  if (!profile.data) {
    return notFound("League not found.", { warnings: profile.warnings });
  }

  return successResponse({ data: profile.data, warnings: profile.warnings });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const leagueId = Number(id);

  if (!Number.isInteger(leagueId) || leagueId <= 0) {
    return badRequest("Invalid league id.");
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const payload: Record<string, unknown> = {};

    if (typeof body.name === "string") payload.name = body.name.trim();
    if (typeof body.nationalityId === "number") payload.nationalityId = body.nationalityId;
    if (typeof body.logoUrl === "string" || body.logoUrl === null) payload.logoUrl = body.logoUrl;

    const updated = await updateLeague(leagueId, payload);

    if (!updated) {
      return notFound("League not found.");
    }

    return successResponse({ data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update league.";
    return badRequest(message);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const leagueId = Number(id);

  if (!Number.isInteger(leagueId) || leagueId <= 0) {
    return badRequest("Invalid league id.");
  }

  try {
    const deleted = await deleteLeague(leagueId);

    if (!deleted) {
      return notFound("League not found.");
    }

    if (!deleted.deleted) {
      return conflict(deleted.error, { dependencies: deleted.dependencies });
    }

    return successResponse({});
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete league.";
    return badRequest(message);
  }
}