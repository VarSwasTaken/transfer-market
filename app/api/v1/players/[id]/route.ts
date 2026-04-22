import { getPlayerProfile } from "@/lib/services/player-profile";
import { deletePlayer, updatePlayer } from "@/lib/services/players-write";
import { badRequest, conflict, notFound, successResponse } from "@/lib/http/api-response";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const playerId = Number(id);

  if (!Number.isInteger(playerId) || playerId <= 0) {
    return badRequest("Invalid player id.");
  }

  const profile = await getPlayerProfile(playerId);

  if (!profile.data) {
    return notFound("Player not found.", { warnings: profile.warnings });
  }

  return successResponse({ data: profile.data, warnings: profile.warnings });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const playerId = Number(id);

  if (!Number.isInteger(playerId) || playerId <= 0) {
    return badRequest("Invalid player id.");
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const payload: Record<string, unknown> = {};

    if (typeof body.firstName === "string") payload.firstName = body.firstName.trim();
    if (typeof body.lastName === "string") payload.lastName = body.lastName.trim();
    if (typeof body.birthDate === "string") payload.birthDate = body.birthDate;
    if (typeof body.position === "string") payload.position = body.position.toUpperCase();
    if (
      body.preferredFoot === "LEFT" ||
      body.preferredFoot === "RIGHT" ||
      body.preferredFoot === "BOTH"
    ) {
      payload.preferredFoot = body.preferredFoot;
    }
    if (typeof body.marketValue === "string" || typeof body.marketValue === "number") {
      payload.marketValue = body.marketValue;
    }
    if (typeof body.nationalityId === "number") payload.nationalityId = body.nationalityId;
    if (typeof body.clubId === "number" || body.clubId === null) payload.clubId = body.clubId;
    if (typeof body.agentId === "number" || body.agentId === null) payload.agentId = body.agentId;
    if (typeof body.height === "number" || body.height === null) payload.height = body.height;
    if (typeof body.weight === "number" || body.weight === null) payload.weight = body.weight;
    if (typeof body.imageUrl === "string" || body.imageUrl === null)
      payload.imageUrl = body.imageUrl;

    const updated = await updatePlayer(playerId, payload);

    if (!updated) {
      return notFound("Player not found.");
    }

    return successResponse({ data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update player.";
    return badRequest(message);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const playerId = Number(id);

  if (!Number.isInteger(playerId) || playerId <= 0) {
    return badRequest("Invalid player id.");
  }

  try {
    const deleted = await deletePlayer(playerId);

    if (!deleted) {
      return notFound("Player not found.");
    }

    if (!deleted.deleted) {
      return conflict(deleted.error, { dependencies: deleted.dependencies });
    }

    return successResponse({});
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete player.";
    return badRequest(message);
  }
}
