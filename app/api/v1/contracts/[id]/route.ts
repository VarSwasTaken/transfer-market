import { getContractProfile } from "@/lib/services/contract-profile";
import { deleteContract, updateContract } from "@/lib/services/contracts-write";
import { badRequest, notFound, successResponse } from "@/lib/http/api-response";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const contractId = Number(id);

  if (!Number.isInteger(contractId) || contractId <= 0) {
    return badRequest("Invalid contract id.");
  }

  const profile = await getContractProfile(contractId);

  if (!profile.data) {
    return notFound("Contract not found.");
  }

  return successResponse({ data: profile.data });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const contractId = Number(id);

  if (!Number.isInteger(contractId) || contractId <= 0) {
    return badRequest("Invalid contract id.");
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const payload: Record<string, unknown> = {};

    if (typeof body.playerId === "number") payload.playerId = body.playerId;
    if (typeof body.startDate === "string") payload.startDate = body.startDate;
    if (typeof body.endDate === "string") payload.endDate = body.endDate;
    if (typeof body.salary === "string" || typeof body.salary === "number") {
      payload.salary = body.salary;
    }
    if (
      typeof body.releaseClause === "string" ||
      typeof body.releaseClause === "number" ||
      body.releaseClause === null
    ) {
      payload.releaseClause = body.releaseClause;
    }

    const updated = await updateContract(contractId, payload);

    if (!updated) {
      return notFound("Contract not found.");
    }

    return successResponse({ data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update contract.";
    return badRequest(message);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const contractId = Number(id);

  if (!Number.isInteger(contractId) || contractId <= 0) {
    return badRequest("Invalid contract id.");
  }

  try {
    const deleted = await deleteContract(contractId);

    if (!deleted) {
      return notFound("Contract not found.");
    }

    return successResponse({});
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete contract.";
    return badRequest(message);
  }
}
