import { getAgentProfile } from "@/lib/services/agent-profile";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const agentId = Number(id);

  if (!Number.isInteger(agentId) || agentId <= 0) {
    return Response.json(
      {
        ok: false,
        error: "Invalid agent id.",
      },
      {
        status: 400,
      },
    );
  }

  const profile = await getAgentProfile(agentId);

  if (!profile.data) {
    return Response.json(
      {
        ok: false,
        error: "Agent not found.",
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
