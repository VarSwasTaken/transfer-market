import { badRequest, notFound, successResponse } from "@/lib/http/api-response";
import {
  deleteTransferRumor,
  getTransferRumorById,
  updateTransferRumor,
} from "@/lib/services/transfer-rumors";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const rumor = await getTransferRumorById(id);

    if (!rumor) {
      return notFound("Transfer rumor not found.");
    }

    return successResponse({ data: rumor });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch transfer rumor.";
    return badRequest(message);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;

    const updated = await updateTransferRumor(id, {
      playerId: typeof body.playerId === "number" ? body.playerId : undefined,
      fromClubId:
        typeof body.fromClubId === "number" || body.fromClubId === null
          ? body.fromClubId
          : undefined,
      toClubId:
        typeof body.toClubId === "number" || body.toClubId === null
          ? body.toClubId
          : undefined,
      source: typeof body.source === "string" ? body.source : undefined,
      credibility:
        typeof body.credibility === "string"
          ? (body.credibility as "Low" | "Medium" | "High")
          : undefined,
      status:
        typeof body.status === "string"
          ? (body.status as "Active" | "Confirmed" | "Denied" | "Expired")
          : undefined,
      rumorType:
        typeof body.rumorType === "string"
          ? (body.rumorType as "Transfer" | "Loan" | "Swap")
          : undefined,
      rumoredFee: typeof body.rumoredFee === "number" ? body.rumoredFee : undefined,
      rumoredLoanFee: typeof body.rumoredLoanFee === "number" ? body.rumoredLoanFee : undefined,
      salaryExpectation:
        typeof body.salaryExpectation === "number" ? body.salaryExpectation : undefined,
      contractYears: typeof body.contractYears === "number" ? body.contractYears : undefined,
      currency: typeof body.currency === "string" ? body.currency : undefined,
      links: Array.isArray(body.links) ? body.links.filter((item): item is string => typeof item === "string") : undefined,
      notes:
        typeof body.notes === "string"
          ? body.notes
          : body.notes === null
            ? null
            : undefined,
      publishedAt: typeof body.publishedAt === "string" ? body.publishedAt : undefined,
      expiresAt:
        typeof body.expiresAt === "string"
          ? body.expiresAt
          : body.expiresAt === null
            ? null
            : undefined,
    });

    if (!updated) {
      return notFound("Transfer rumor not found.");
    }

    return successResponse({ data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update transfer rumor.";
    return badRequest(message);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const deleted = await deleteTransferRumor(id);

    if (!deleted) {
      return notFound("Transfer rumor not found.");
    }

    return successResponse({});
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete transfer rumor.";
    return badRequest(message);
  }
}
