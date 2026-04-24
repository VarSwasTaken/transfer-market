import { getClubProfile } from '@/lib/services/club-profile';
import { deleteClub, updateClub } from '@/lib/services/clubs-write';
import { badRequest, conflict, notFound, successResponse } from '@/lib/http/api-response';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const clubId = Number(id);

  if (!Number.isInteger(clubId) || clubId <= 0) {
    return badRequest('Invalid club id.');
  }

  const profile = await getClubProfile(clubId);

  if (!profile.data) {
    return notFound('Club not found.', { warnings: profile.warnings });
  }

  return successResponse({ data: profile.data, warnings: profile.warnings });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const clubId = Number(id);

  if (!Number.isInteger(clubId) || clubId <= 0) {
    return badRequest('Invalid club id.');
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const payload: Record<string, unknown> = {};

    if (typeof body.name === 'string') payload.name = body.name.trim();
    if (typeof body.budget === 'string' || typeof body.budget === 'number') {
      payload.budget = body.budget;
    }
    if (typeof body.leagueId === 'number') payload.leagueId = body.leagueId;
    if (typeof body.logoUrl === 'string' || body.logoUrl === null) payload.logoUrl = body.logoUrl;

    const updated = await updateClub(clubId, payload);

    if (!updated) {
      return notFound('Club not found.');
    }

    return successResponse({ data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update club.';
    return badRequest(message);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const clubId = Number(id);

  if (!Number.isInteger(clubId) || clubId <= 0) {
    return badRequest('Invalid club id.');
  }

  try {
    const deleted = await deleteClub(clubId);

    if (!deleted) {
      return notFound('Club not found.');
    }

    if (!deleted.deleted) {
      return conflict(deleted.error, { dependencies: deleted.dependencies });
    }

    return successResponse({});
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete club.';
    return badRequest(message);
  }
}
