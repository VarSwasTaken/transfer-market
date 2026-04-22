import { getClubProfile } from "@/lib/services/club-profile";

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
