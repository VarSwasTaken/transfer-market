import { getPlayerProfile } from "@/lib/services/player-profile";
import { updatePlayer } from "@/lib/services/players-write";

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
    return Response.json(
      {
        ok: false,
        error: "Invalid player id.",
      },
      {
        status: 400,
      },
    );
  }

  const profile = await getPlayerProfile(playerId);

  if (!profile.data) {
    return Response.json(
      {
        ok: false,
        error: "Player not found.",
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
  const playerId = Number(id);

  if (!Number.isInteger(playerId) || playerId <= 0) {
    return Response.json(
      {
        ok: false,
        error: "Invalid player id.",
      },
      {
        status: 400,
      },
    );
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
      return Response.json({ ok: false, error: "Player not found." }, { status: 404 });
    }

    return Response.json({ ok: true, data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update player.";
    return Response.json({ ok: false, error: message }, { status: 400 });
  }
}
