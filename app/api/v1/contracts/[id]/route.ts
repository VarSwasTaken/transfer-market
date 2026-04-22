import { getContractProfile } from "@/lib/services/contract-profile";
import { deleteContract, updateContract } from "@/lib/services/contracts-write";

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
    return Response.json({ ok: false, error: "Invalid contract id." }, { status: 400 });
  }

  const profile = await getContractProfile(contractId);

  if (!profile.data) {
    return Response.json({ ok: false, error: "Contract not found." }, { status: 404 });
  }

  return Response.json({ ok: true, data: profile.data });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const contractId = Number(id);

  if (!Number.isInteger(contractId) || contractId <= 0) {
    return Response.json({ ok: false, error: "Invalid contract id." }, { status: 400 });
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
      return Response.json({ ok: false, error: "Contract not found." }, { status: 404 });
    }

    return Response.json({ ok: true, data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update contract.";
    return Response.json({ ok: false, error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const contractId = Number(id);

  if (!Number.isInteger(contractId) || contractId <= 0) {
    return Response.json({ ok: false, error: "Invalid contract id." }, { status: 400 });
  }

  try {
    const deleted = await deleteContract(contractId);

    if (!deleted) {
      return Response.json({ ok: false, error: "Contract not found." }, { status: 404 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete contract.";
    return Response.json({ ok: false, error: message }, { status: 409 });
  }
}
