import { badRequest, notFound, successResponse } from "@/lib/http/api-response";
import { updateTransferRumor } from "@/lib/services/transfer-rumors";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;

    if (
      typeof body.status !== "string" ||
      (body.status !== "Active" &&
        body.status !== "Confirmed" &&
        body.status !== "Denied" &&
        body.status !== "Expired")
    ) {
      return badRequest("Invalid rumor status.");
    }

    const updated = await updateTransferRumor(id, {
      status: body.status,
    });

    if (!updated) {
      return notFound("Transfer rumor not found.");
    }

    return successResponse({ data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update transfer rumor status.";
    return badRequest(message);
  }
}
