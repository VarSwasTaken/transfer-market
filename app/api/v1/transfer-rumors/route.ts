import { badRequest, createdResponse, successResponse } from "@/lib/http/api-response";
import { createTransferRumor, listTransferRumors } from "@/lib/services/transfer-rumors";

export const runtime = "nodejs";

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  const page = parsePositiveInt(url.searchParams.get("page"), 1);
  const limit = parsePositiveInt(url.searchParams.get("limit"), 20);

  const playerIdParam = url.searchParams.get("playerId");
  const fromClubIdParam = url.searchParams.get("fromClubId");
  const toClubIdParam = url.searchParams.get("toClubId");
  const status = url.searchParams.get("status") || undefined;
  const credibility = url.searchParams.get("credibility") || undefined;
  const rumorType = url.searchParams.get("rumorType") || undefined;
  const source = url.searchParams.get("source")?.trim() || undefined;

  const playerId = playerIdParam ? Number(playerIdParam) : undefined;
  const fromClubId = fromClubIdParam ? Number(fromClubIdParam) : undefined;
  const toClubId = toClubIdParam ? Number(toClubIdParam) : undefined;

  if (playerIdParam && (!Number.isInteger(playerId) || Number(playerId) <= 0)) {
    return badRequest("Invalid playerId filter.");
  }

  if (fromClubIdParam && (!Number.isInteger(fromClubId) || Number(fromClubId) <= 0)) {
    return badRequest("Invalid fromClubId filter.");
  }

  if (toClubIdParam && (!Number.isInteger(toClubId) || Number(toClubId) <= 0)) {
    return badRequest("Invalid toClubId filter.");
  }

  const { items, total } = await listTransferRumors({
    page,
    limit,
    playerId,
    fromClubId,
    toClubId,
    status:
      status && (status === "Active" || status === "Confirmed" || status === "Denied" || status === "Expired")
        ? status
        : undefined,
    credibility:
      credibility && (credibility === "Low" || credibility === "Medium" || credibility === "High")
        ? credibility
        : undefined,
    rumorType:
      rumorType && (rumorType === "Transfer" || rumorType === "Loan" || rumorType === "Swap")
        ? rumorType
        : undefined,
    source,
  });

  return successResponse({
    data: items,
    meta: {
      page,
      limit,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    if (typeof body.playerId !== "number" || typeof body.source !== "string") {
      return badRequest("Invalid payload for transfer rumor creation.");
    }

    const created = await createTransferRumor({
      playerId: body.playerId,
      fromClubId:
        typeof body.fromClubId === "number" || body.fromClubId === null
          ? body.fromClubId
          : undefined,
      toClubId:
        typeof body.toClubId === "number" || body.toClubId === null
          ? body.toClubId
          : undefined,
      source: body.source,
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
      notes: typeof body.notes === "string" ? body.notes : body.notes === null ? null : undefined,
      publishedAt: typeof body.publishedAt === "string" ? body.publishedAt : undefined,
      expiresAt: typeof body.expiresAt === "string" ? body.expiresAt : body.expiresAt === null ? null : undefined,
    });

    return createdResponse({ data: created });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create transfer rumor.";
    return badRequest(message);
  }
}
