import { badRequest, notFound, successResponse } from "@/lib/http/api-response";
import { deleteInjury, getInjuryById, updateInjury } from "@/lib/services/injuries";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const injury = await getInjuryById(id);

    if (!injury) {
      return notFound("Injury not found.");
    }

    return successResponse({ data: injury });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch injury.";
    return badRequest(message);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;

    const updated = await updateInjury(id, {
      playerId: typeof body.playerId === "number" ? body.playerId : undefined,
      type: typeof body.type === "string" ? body.type : undefined,
      severity:
        typeof body.severity === "string"
          ? (body.severity as "Lekka" | "Średnia" | "Poważna" | "Krytyczna")
          : undefined,
      startDate: typeof body.startDate === "string" ? body.startDate : undefined,
      expectedReturnDate:
        typeof body.expectedReturnDate === "string"
          ? body.expectedReturnDate
          : body.expectedReturnDate === null
            ? null
            : undefined,
      actualReturnDate:
        typeof body.actualReturnDate === "string"
          ? body.actualReturnDate
          : body.actualReturnDate === null
            ? null
            : undefined,
      status:
        typeof body.status === "string"
          ? (body.status as "W trakcie leczenia" | "Rehabilitacja" | "Wyleczona")
          : undefined,
      description:
        typeof body.description === "string"
          ? body.description
          : body.description === null
            ? null
            : undefined,
      treatment:
        typeof body.treatment === "string"
          ? body.treatment
          : body.treatment === null
            ? null
            : undefined,
      reportedBy:
        typeof body.reportedBy === "string"
          ? body.reportedBy
          : body.reportedBy === null
            ? null
            : undefined,
    });

    if (!updated) {
      return notFound("Injury not found.");
    }

    return successResponse({ data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update injury.";
    return badRequest(message);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const deleted = await deleteInjury(id);

    if (!deleted) {
      return notFound("Injury not found.");
    }

    return successResponse({});
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete injury.";
    return badRequest(message);
  }
}
