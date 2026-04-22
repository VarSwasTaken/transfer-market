import { TransferType } from "@prisma/client";

import { badRequest, createdResponse, successResponse } from "@/lib/http/api-response";
import { getTransfersList } from "@/lib/services/transfers-list";
import { createTransfer } from "@/lib/services/transfers-write";

export const runtime = "nodejs";

function parsePositiveInt(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function parseTransferType(value: string | null): TransferType | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.toUpperCase();
  if (normalized in TransferType) {
    return TransferType[normalized as keyof typeof TransferType];
  }

  return undefined;
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  const page = parsePositiveInt(url.searchParams.get("page")) ?? 1;
  const limit = parsePositiveInt(url.searchParams.get("limit")) ?? 20;

  const playerId = parsePositiveInt(url.searchParams.get("playerId")) ?? undefined;
  const fromClubId = parsePositiveInt(url.searchParams.get("fromClubId")) ?? undefined;
  const toClubId = parsePositiveInt(url.searchParams.get("toClubId")) ?? undefined;
  const transferType = parseTransferType(url.searchParams.get("transferType"));

  const result = await getTransfersList({
    page,
    limit,
    playerId,
    fromClubId,
    toClubId,
    transferType,
  });

  return successResponse({ data: result.data, meta: result.meta });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    if (
      typeof body.playerId !== "number" ||
      typeof body.toClubId !== "number" ||
      (typeof body.fee !== "string" && typeof body.fee !== "number")
    ) {
      return badRequest("Invalid payload for transfer creation.");
    }

    if (
      body.transferType !== undefined &&
      body.transferType !== "PERMANENT" &&
      body.transferType !== "LOAN" &&
      body.transferType !== "FREE"
    ) {
      return badRequest("Invalid transferType value.");
    }

    if (
      body.contract !== undefined &&
      body.contract !== null &&
      (typeof body.contract !== "object" || Array.isArray(body.contract))
    ) {
      return badRequest("Invalid contract object.");
    }

    const contract = body.contract as Record<string, unknown> | null | undefined;

    if (
      contract &&
      (typeof contract.startDate !== "string" ||
        typeof contract.endDate !== "string" ||
        (typeof contract.salary !== "string" && typeof contract.salary !== "number"))
    ) {
      return badRequest("Invalid contract payload.");
    }

    const created = await createTransfer({
      playerId: body.playerId,
      toClubId: body.toClubId,
      fee: body.fee,
      transferType:
        body.transferType === "PERMANENT" ||
        body.transferType === "LOAN" ||
        body.transferType === "FREE"
          ? body.transferType
          : undefined,
      date: typeof body.date === "string" ? body.date : undefined,
      fromClubId:
        typeof body.fromClubId === "number" || body.fromClubId === null
          ? body.fromClubId
          : undefined,
      contract: contract
        ? {
            startDate: contract.startDate as string,
            endDate: contract.endDate as string,
            salary: contract.salary as string | number,
            releaseClause:
              typeof contract.releaseClause === "string" ||
              typeof contract.releaseClause === "number" ||
              contract.releaseClause === null
                ? (contract.releaseClause as string | number | null)
                : undefined,
          }
        : undefined,
    });

    return createdResponse({ data: created });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create transfer.";
    return badRequest(message);
  }
}
