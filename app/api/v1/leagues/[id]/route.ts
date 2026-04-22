import { getLeagueProfile } from "@/lib/services/league-profile";

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
