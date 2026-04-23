import mongoose from "mongoose";

import TransferRumor from "@/models/TransferRumor";

import { connectToDatabase } from "@/lib/mongoose";
import { prisma } from "@/lib/prisma";

const VALID_CREDIBILITY = ["Low", "Medium", "High"] as const;
const VALID_STATUS = ["Active", "Confirmed", "Denied", "Expired"] as const;
const VALID_RUMOR_TYPES = ["Transfer", "Loan", "Swap"] as const;

type RumorCredibility = (typeof VALID_CREDIBILITY)[number];
type RumorStatus = (typeof VALID_STATUS)[number];
type RumorType = (typeof VALID_RUMOR_TYPES)[number];

export type TransferRumorDto = {
  id: string;
  playerId: number;
  fromClubId: number | null;
  toClubId: number | null;
  source: string;
  credibility: RumorCredibility;
  status: RumorStatus;
  rumorType: RumorType;
  rumoredFee: number | null;
  rumoredLoanFee: number | null;
  salaryExpectation: number | null;
  contractYears: number | null;
  currency: string;
  links: string[];
  notes: string | null;
  publishedAt: string;
  expiresAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ListTransferRumorsParams = {
  page: number;
  limit: number;
  playerId?: number;
  fromClubId?: number;
  toClubId?: number;
  status?: RumorStatus;
  credibility?: RumorCredibility;
  rumorType?: RumorType;
  source?: string;
};

export type CreateTransferRumorInput = {
  playerId: number;
  fromClubId?: number | null;
  toClubId?: number | null;
  source: string;
  credibility?: RumorCredibility;
  status?: RumorStatus;
  rumorType?: RumorType;
  rumoredFee?: number;
  rumoredLoanFee?: number;
  salaryExpectation?: number;
  contractYears?: number;
  currency?: string;
  links?: string[];
  notes?: string | null;
  publishedAt?: string;
  expiresAt?: string | null;
};

export type UpdateTransferRumorInput = Partial<CreateTransferRumorInput>;

function assertValidObjectId(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid transfer rumor id.");
  }
}

function assertPositiveInt(value: unknown, fieldName: string): number {
  if (!Number.isInteger(value) || Number(value) <= 0) {
    throw new Error(`Invalid ${fieldName}.`);
  }
  return Number(value);
}

function assertNonNegativeNumber(value: unknown, fieldName: string): number {
  if (typeof value !== "number" || value < 0) {
    throw new Error(`${fieldName} must be a non-negative number.`);
  }
  return value;
}

function assertCredibility(value: unknown): RumorCredibility {
  if (typeof value !== "string" || !VALID_CREDIBILITY.includes(value as RumorCredibility)) {
    throw new Error("Invalid rumor credibility.");
  }
  return value as RumorCredibility;
}

function assertStatus(value: unknown): RumorStatus {
  if (typeof value !== "string" || !VALID_STATUS.includes(value as RumorStatus)) {
    throw new Error("Invalid rumor status.");
  }
  return value as RumorStatus;
}

function isStatusTransitionAllowed(current: RumorStatus, next: RumorStatus): boolean {
  if (current === next) {
    return true;
  }

  if (current === "Active") {
    return next === "Confirmed" || next === "Denied" || next === "Expired";
  }

  return false;
}

function assertRumorType(value: unknown): RumorType {
  if (typeof value !== "string" || !VALID_RUMOR_TYPES.includes(value as RumorType)) {
    throw new Error("Invalid rumor type.");
  }
  return value as RumorType;
}

function toDateOrNull(value: string | null | undefined, fieldName: string): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid ${fieldName}.`);
  }

  return parsed;
}

function toDateOrNow(value: string | undefined, fieldName: string): Date {
  const parsed = toDateOrNull(value ?? null, fieldName);
  return parsed ?? new Date();
}

function normalizeLinks(value: unknown): string[] {
  if (!Array.isArray(value)) {
    throw new Error("links must be an array of strings.");
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function normalizeCurrency(value: unknown): string {
  if (value === undefined) {
    return "EUR";
  }
  if (typeof value !== "string" || value.trim().length !== 3) {
    throw new Error("currency must be a 3-letter code.");
  }
  return value.trim().toUpperCase();
}

async function assertPlayerExists(playerId: number) {
  const player = await prisma.player.findUnique({
    where: { id: playerId },
    select: { id: true },
  });

  if (!player) {
    throw new Error("Player not found.");
  }
}

async function assertClubExists(clubId: number, fieldName: "fromClubId" | "toClubId") {
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { id: true },
  });

  if (!club) {
    throw new Error(`${fieldName} references a non-existing club.`);
  }
}

function mapTransferRumor(doc: {
  id: string;
  playerId: number;
  fromClubId?: number | null;
  toClubId?: number | null;
  source: string;
  credibility: RumorCredibility;
  status: RumorStatus;
  rumorType: RumorType;
  rumoredFee?: number | null;
  rumoredLoanFee?: number | null;
  salaryExpectation?: number | null;
  contractYears?: number | null;
  currency: string;
  links?: string[];
  notes?: string | null;
  publishedAt: Date;
  expiresAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}): TransferRumorDto {
  return {
    id: doc.id,
    playerId: doc.playerId,
    fromClubId: doc.fromClubId ?? null,
    toClubId: doc.toClubId ?? null,
    source: doc.source,
    credibility: doc.credibility,
    status: doc.status,
    rumorType: doc.rumorType,
    rumoredFee: doc.rumoredFee ?? null,
    rumoredLoanFee: doc.rumoredLoanFee ?? null,
    salaryExpectation: doc.salaryExpectation ?? null,
    contractYears: doc.contractYears ?? null,
    currency: doc.currency,
    links: doc.links ?? [],
    notes: doc.notes ?? null,
    publishedAt: doc.publishedAt.toISOString(),
    expiresAt: doc.expiresAt?.toISOString() ?? null,
    createdAt: doc.createdAt?.toISOString() ?? null,
    updatedAt: doc.updatedAt?.toISOString() ?? null,
  };
}

export async function listTransferRumors(params: ListTransferRumorsParams) {
  await connectToDatabase();

  const filter: {
    playerId?: number;
    fromClubId?: number;
    toClubId?: number;
    status?: RumorStatus;
    credibility?: RumorCredibility;
    rumorType?: RumorType;
    source?: RegExp;
  } = {};

  if (params.playerId) {
    filter.playerId = params.playerId;
  }
  if (params.fromClubId) {
    filter.fromClubId = params.fromClubId;
  }
  if (params.toClubId) {
    filter.toClubId = params.toClubId;
  }
  if (params.status) {
    filter.status = params.status;
  }
  if (params.credibility) {
    filter.credibility = params.credibility;
  }
  if (params.rumorType) {
    filter.rumorType = params.rumorType;
  }
  if (params.source) {
    filter.source = new RegExp(params.source, "i");
  }

  const skip = (params.page - 1) * params.limit;

  const [items, total] = await Promise.all([
    TransferRumor.find(filter)
      .sort({ publishedAt: -1, _id: -1 })
      .skip(skip)
      .limit(params.limit)
      .exec(),
    TransferRumor.countDocuments(filter),
  ]);

  return {
    items: items.map((item) => mapTransferRumor(item)),
    total,
  };
}

export async function getTransferRumorById(id: string) {
  assertValidObjectId(id);
  await connectToDatabase();

  const item = await TransferRumor.findById(id).exec();
  if (!item) {
    return null;
  }

  return mapTransferRumor(item);
}

export async function createTransferRumor(input: CreateTransferRumorInput) {
  const playerId = assertPositiveInt(input.playerId, "playerId");

  if (typeof input.source !== "string" || input.source.trim().length === 0) {
    throw new Error("source is required.");
  }

  const fromClubId =
    input.fromClubId === undefined || input.fromClubId === null
      ? null
      : assertPositiveInt(input.fromClubId, "fromClubId");
  const toClubId =
    input.toClubId === undefined || input.toClubId === null
      ? null
      : assertPositiveInt(input.toClubId, "toClubId");

  if (fromClubId !== null && toClubId !== null && fromClubId === toClubId) {
    throw new Error("fromClubId and toClubId cannot be the same.");
  }

  const rumoredFee =
    input.rumoredFee === undefined ? undefined : assertNonNegativeNumber(input.rumoredFee, "rumoredFee");
  const rumoredLoanFee =
    input.rumoredLoanFee === undefined
      ? undefined
      : assertNonNegativeNumber(input.rumoredLoanFee, "rumoredLoanFee");
  const salaryExpectation =
    input.salaryExpectation === undefined
      ? undefined
      : assertNonNegativeNumber(input.salaryExpectation, "salaryExpectation");
  const contractYears =
    input.contractYears === undefined
      ? undefined
      : assertPositiveInt(input.contractYears, "contractYears");

  if (contractYears !== undefined && contractYears > 10) {
    throw new Error("contractYears must be less than or equal to 10.");
  }

  await assertPlayerExists(playerId);

  if (fromClubId !== null) {
    await assertClubExists(fromClubId, "fromClubId");
  }
  if (toClubId !== null) {
    await assertClubExists(toClubId, "toClubId");
  }

  await connectToDatabase();

  const created = await TransferRumor.create({
    playerId,
    fromClubId,
    toClubId,
    source: input.source.trim(),
    credibility: input.credibility ? assertCredibility(input.credibility) : "Medium",
    status: input.status ? assertStatus(input.status) : "Active",
    rumorType: input.rumorType ? assertRumorType(input.rumorType) : "Transfer",
    rumoredFee,
    rumoredLoanFee,
    salaryExpectation,
    contractYears,
    currency: normalizeCurrency(input.currency),
    links: input.links ? normalizeLinks(input.links) : [],
    notes: input.notes ?? null,
    publishedAt: toDateOrNow(input.publishedAt, "publishedAt"),
    expiresAt: toDateOrNull(input.expiresAt, "expiresAt"),
  });

  return mapTransferRumor(created);
}

export async function updateTransferRumor(id: string, input: UpdateTransferRumorInput) {
  assertValidObjectId(id);

  const payload: Record<string, unknown> = {};
  let requestedStatus: RumorStatus | undefined;

  if (input.playerId !== undefined) {
    const playerId = assertPositiveInt(input.playerId, "playerId");
    await assertPlayerExists(playerId);
    payload.playerId = playerId;
  }

  if (input.fromClubId !== undefined) {
    if (input.fromClubId === null) {
      payload.fromClubId = null;
    } else {
      const fromClubId = assertPositiveInt(input.fromClubId, "fromClubId");
      await assertClubExists(fromClubId, "fromClubId");
      payload.fromClubId = fromClubId;
    }
  }

  if (input.toClubId !== undefined) {
    if (input.toClubId === null) {
      payload.toClubId = null;
    } else {
      const toClubId = assertPositiveInt(input.toClubId, "toClubId");
      await assertClubExists(toClubId, "toClubId");
      payload.toClubId = toClubId;
    }
  }

  if (input.source !== undefined) {
    if (typeof input.source !== "string" || input.source.trim().length === 0) {
      throw new Error("source cannot be empty.");
    }
    payload.source = input.source.trim();
  }

  if (input.credibility !== undefined) {
    payload.credibility = assertCredibility(input.credibility);
  }

  if (input.status !== undefined) {
    requestedStatus = assertStatus(input.status);
  }

  if (input.rumorType !== undefined) {
    payload.rumorType = assertRumorType(input.rumorType);
  }

  if (input.rumoredFee !== undefined) {
    payload.rumoredFee = assertNonNegativeNumber(input.rumoredFee, "rumoredFee");
  }

  if (input.rumoredLoanFee !== undefined) {
    payload.rumoredLoanFee = assertNonNegativeNumber(input.rumoredLoanFee, "rumoredLoanFee");
  }

  if (input.salaryExpectation !== undefined) {
    payload.salaryExpectation = assertNonNegativeNumber(input.salaryExpectation, "salaryExpectation");
  }

  if (input.contractYears !== undefined) {
    const contractYears = assertPositiveInt(input.contractYears, "contractYears");
    if (contractYears > 10) {
      throw new Error("contractYears must be less than or equal to 10.");
    }
    payload.contractYears = contractYears;
  }

  if (input.currency !== undefined) {
    payload.currency = normalizeCurrency(input.currency);
  }

  if (input.links !== undefined) {
    payload.links = normalizeLinks(input.links);
  }

  if (input.notes !== undefined) {
    payload.notes = input.notes;
  }

  if (input.publishedAt !== undefined) {
    const parsedPublishedAt = toDateOrNull(input.publishedAt, "publishedAt");
    if (!parsedPublishedAt) {
      throw new Error("publishedAt cannot be null.");
    }
    payload.publishedAt = parsedPublishedAt;
  }

  if (input.expiresAt !== undefined) {
    payload.expiresAt = toDateOrNull(input.expiresAt, "expiresAt");
  }

  await connectToDatabase();

  const existing = await TransferRumor.findById(id)
    .select({ status: 1, fromClubId: 1, toClubId: 1 })
    .exec();

  if (!existing) {
    return null;
  }

  const nextFromClubId =
    payload.fromClubId !== undefined
      ? (payload.fromClubId as number | null)
      : (existing.fromClubId ?? null);
  const nextToClubId =
    payload.toClubId !== undefined
      ? (payload.toClubId as number | null)
      : (existing.toClubId ?? null);

  if (
    nextFromClubId !== null &&
    nextToClubId !== null &&
    nextFromClubId === nextToClubId
  ) {
    throw new Error("fromClubId and toClubId cannot be the same.");
  }

  if (requestedStatus !== undefined) {
    const currentStatus = assertStatus(existing.status);
    if (!isStatusTransitionAllowed(currentStatus, requestedStatus)) {
      throw new Error(`Status transition not allowed: ${currentStatus} -> ${requestedStatus}.`);
    }
    payload.status = requestedStatus;
  }

  const updated = await TransferRumor.findByIdAndUpdate(id, payload, { new: true }).exec();
  if (!updated) {
    return null;
  }

  return mapTransferRumor(updated);
}

export async function deleteTransferRumor(id: string) {
  assertValidObjectId(id);
  await connectToDatabase();

  const deleted = await TransferRumor.findByIdAndDelete(id).exec();
  return deleted !== null;
}
