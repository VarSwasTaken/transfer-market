import { badRequest, notFound, successResponse } from "@/lib/http/api-response";
import {
  deleteScoutReport,
  getScoutReportById,
  updateScoutReport,
} from "@/lib/services/scout-reports";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const report = await getScoutReportById(id);

    if (!report) {
      return notFound("Scouting report not found.");
    }

    return successResponse({ data: report });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch scouting report.";
    return badRequest(message);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as Record<string, unknown>;

    const updated = await updateScoutReport(id, {
      playerId: typeof body.playerId === "number" ? body.playerId : undefined,
      scoutName: typeof body.scoutName === "string" ? body.scoutName : undefined,
      date: typeof body.date === "string" ? body.date : undefined,
      rating: typeof body.rating === "number" ? body.rating : undefined,
      potential:
        typeof body.potential === "string"
          ? (body.potential as "Low" | "Medium" | "High" | "World Class")
          : undefined,
      pros: Array.isArray(body.pros) ? body.pros.filter((item): item is string => typeof item === "string") : undefined,
      cons: Array.isArray(body.cons) ? body.cons.filter((item): item is string => typeof item === "string") : undefined,
      notes:
        typeof body.notes === "string"
          ? body.notes
          : body.notes === null
            ? null
            : undefined,
      attributes:
        typeof body.attributes === "object" && body.attributes !== null
          ? (body.attributes as {
              pace?: number;
              shooting?: number;
              passing?: number;
              dribbling?: number;
              defending?: number;
              physical?: number;
            })
          : undefined,
    });

    if (!updated) {
      return notFound("Scouting report not found.");
    }

    return successResponse({ data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update scouting report.";
    return badRequest(message);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const deleted = await deleteScoutReport(id);

    if (!deleted) {
      return notFound("Scouting report not found.");
    }

    return successResponse({});
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete scouting report.";
    return badRequest(message);
  }
}
