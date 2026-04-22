import { getAgentProfile } from "@/lib/services/agent-profile";
import { deleteAgent, updateAgent } from "@/lib/services/agents-write";
import { badRequest, conflict, notFound, successResponse } from "@/lib/http/api-response";

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
    return badRequest("Invalid agent id.");
  }

  const profile = await getAgentProfile(agentId);

  if (!profile.data) {
    return notFound("Agent not found.", { warnings: profile.warnings });
  }

  return successResponse({ data: profile.data, warnings: profile.warnings });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const agentId = Number(id);

  if (!Number.isInteger(agentId) || agentId <= 0) {
    return badRequest("Invalid agent id.");
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const payload: Record<string, unknown> = {};

    if (typeof body.name === "string") payload.name = body.name.trim();
    if (typeof body.agency === "string" || body.agency === null) payload.agency = body.agency;

    const updated = await updateAgent(agentId, payload);

    if (!updated) {
      return notFound("Agent not found.");
    }

    return successResponse({ data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update agent.";
    return badRequest(message);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const agentId = Number(id);

  if (!Number.isInteger(agentId) || agentId <= 0) {
    return badRequest("Invalid agent id.");
  }

  try {
    const deleted = await deleteAgent(agentId);

    if (!deleted) {
      return notFound("Agent not found.");
    }

    if (!deleted.deleted) {
      return conflict(deleted.error, { dependencies: deleted.dependencies });
    }

    return successResponse({});
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete agent.";
    return badRequest(message);
  }
}
