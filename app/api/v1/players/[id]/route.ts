import { getPlayerProfile } from "@/lib/services/player-profile";

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
