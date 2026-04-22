import { badRequest, conflict, createdResponse, notFound } from "@/lib/http/api-response";
import { completeLoanTransfer } from "@/lib/services/transfers-write";

export const runtime = "nodejs";

const loanCompletionConflictMessages = new Set([
  "Only LOAN transfers can be completed with this endpoint.",
  "Loan transfer has no origin club to return to.",
  "Loan cannot be completed because player is not in the loan destination club.",
]);

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const transferId = Number(id);

  if (!Number.isInteger(transferId) || transferId <= 0) {
    return badRequest("Invalid transfer id.");
  }

  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    if (body.returnDate !== undefined && typeof body.returnDate !== "string") {
      return badRequest("returnDate must be a string in ISO format.");
    }

    const completed = await completeLoanTransfer(transferId, {
      returnDate: typeof body.returnDate === "string" ? body.returnDate : undefined,
    });

    if (!completed) {
      return notFound("Transfer not found.");
    }

    return createdResponse({
      data: {
        completedTransfer: completed.completedTransfer,
        playerId: completed.playerId,
        newClubId: completed.newClubId,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to complete loan transfer.";
    if (loanCompletionConflictMessages.has(message)) {
      return conflict(message);
    }
    return badRequest(message);
  }
}
