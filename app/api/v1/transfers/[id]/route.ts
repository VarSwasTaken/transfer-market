import { TransferType } from "@prisma/client";

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
    return Response.json({ ok: false, error: "Invalid transfer id." }, { status: 400 });
  }

  const profile = await getTransferProfile(transferId);

  if (!profile.data) {
    return Response.json({ ok: false, error: "Transfer not found." }, { status: 404 });
  }

  return Response.json({ ok: true, data: profile.data });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const transferId = Number(id);

  if (!Number.isInteger(transferId) || transferId <= 0) {
    return Response.json({ ok: false, error: "Invalid transfer id." }, { status: 400 });
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
      return Response.json({ ok: false, error: "Transfer not found." }, { status: 404 });
    }

    return Response.json({ ok: true, data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update transfer.";
    return Response.json({ ok: false, error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const transferId = Number(id);

  if (!Number.isInteger(transferId) || transferId <= 0) {
    return Response.json({ ok: false, error: "Invalid transfer id." }, { status: 400 });
  }

  try {
    const deleted = await deleteTransfer(transferId);

    if (!deleted) {
      return Response.json({ ok: false, error: "Transfer not found." }, { status: 404 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete transfer.";
    return Response.json({ ok: false, error: message }, { status: 409 });
  }
}
