import { getAgentProfile } from "@/lib/services/agent-profile";
import { updateAgent } from "@/lib/services/agents-write";

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

export async function PATCH(request: Request, context: RouteContext) {
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

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const payload: Record<string, unknown> = {};

    if (typeof body.name === "string") payload.name = body.name.trim();
    if (typeof body.agency === "string" || body.agency === null) payload.agency = body.agency;

    const updated = await updateAgent(agentId, payload);

    if (!updated) {
      return Response.json({ ok: false, error: "Agent not found." }, { status: 404 });
    }

    return Response.json({ ok: true, data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update agent.";
    return Response.json({ ok: false, error: message }, { status: 400 });
  }
}
