import { TransferType } from "@prisma/client";

import { badRequest, notFound, successResponse } from "@/lib/http/api-response";
import { getTransferProfile } from "@/lib/services/transfer-profile";
import { deleteTransfer, updateTransfer } from "@/lib/services/transfers-write";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const transferId = Number(id);

  if (!Number.isInteger(transferId) || transferId <= 0) {
    return badRequest("Invalid transfer id.");
  }

  const profile = await getTransferProfile(transferId);

  if (!profile.data) {
    return notFound("Transfer not found.");
  }

  return successResponse({ data: profile.data });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const transferId = Number(id);

  if (!Number.isInteger(transferId) || transferId <= 0) {
    return badRequest("Invalid transfer id.");
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const payload: Record<string, unknown> = {};

    if (typeof body.fee === "string" || typeof body.fee === "number") payload.fee = body.fee;
    if (
      body.transferType === TransferType.PERMANENT ||
      body.transferType === TransferType.LOAN ||
      body.transferType === TransferType.FREE
    ) {
      payload.transferType = body.transferType;
    }
    if (typeof body.date === "string") payload.date = body.date;

    const updated = await updateTransfer(transferId, payload);

    if (!updated) {
      return notFound("Transfer not found.");
    }

    return successResponse({ data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update transfer.";
    return badRequest(message);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const transferId = Number(id);

  if (!Number.isInteger(transferId) || transferId <= 0) {
    return badRequest("Invalid transfer id.");
  }

  try {
    const deleted = await deleteTransfer(transferId);

    if (!deleted) {
      return notFound("Transfer not found.");
    }

    return successResponse({});
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete transfer.";
    return badRequest(message);
  }
}
