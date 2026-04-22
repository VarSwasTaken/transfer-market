import mongoose from "mongoose";

import Injury from "@/models/Injury";

import { connectToDatabase } from "@/lib/mongoose";
import { prisma } from "@/lib/prisma";

const VALID_SEVERITIES = ["Lekka", "Średnia", "Poważna", "Krytyczna"] as const;
const VALID_STATUSES = ["W trakcie leczenia", "Rehabilitacja", "Wyleczona"] as const;

type InjurySeverity = (typeof VALID_SEVERITIES)[number];
type InjuryStatus = (typeof VALID_STATUSES)[number];

export type InjuryDto = {
  id: string;
  playerId: number;
  type: string;
  severity: InjurySeverity;
  startDate: string;
  expectedReturnDate: string | null;
  actualReturnDate: string | null;
  status: InjuryStatus;
  description: string | null;
  treatment: string | null;
  reportedBy: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ListInjuriesParams = {
  page: number;
  limit: number;
  playerId?: number;
  status?: InjuryStatus;
};

export type CreateInjuryInput = {
  playerId: number;
  type: string;
  severity: InjurySeverity;
  startDate: string;
  expectedReturnDate?: string | null;
  actualReturnDate?: string | null;
  status?: InjuryStatus;
  description?: string | null;
  treatment?: string | null;
  reportedBy?: string | null;
};

export type UpdateInjuryInput = Partial<CreateInjuryInput>;

function toDateOrNull(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid date value.");
  }

  return parsed;
}

function assertValidObjectId(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid injury id.");
  }
}

function assertSeverity(value: unknown): InjurySeverity {
  if (typeof value !== "string" || !VALID_SEVERITIES.includes(value as InjurySeverity)) {
    throw new Error("Invalid injury severity.");
  }
  return value as InjurySeverity;
}

function assertStatus(value: unknown): InjuryStatus {
  if (typeof value !== "string" || !VALID_STATUSES.includes(value as InjuryStatus)) {
    throw new Error("Invalid injury status.");
  }
  return value as InjuryStatus;
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

function mapInjury(doc: {
  id: string;
  playerId: number;
  type: string;
  severity: InjurySeverity;
  startDate: Date;
  expectedReturnDate?: Date | null;
  actualReturnDate?: Date | null;
  status: InjuryStatus;
  description?: string | null;
  treatment?: string | null;
  reportedBy?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}): InjuryDto {
  return {
    id: doc.id,
    playerId: doc.playerId,
    type: doc.type,
    severity: doc.severity,
    startDate: doc.startDate.toISOString(),
    expectedReturnDate: doc.expectedReturnDate?.toISOString() ?? null,
    actualReturnDate: doc.actualReturnDate?.toISOString() ?? null,
    status: doc.status,
    description: doc.description ?? null,
    treatment: doc.treatment ?? null,
    reportedBy: doc.reportedBy ?? null,
    createdAt: doc.createdAt?.toISOString() ?? null,
    updatedAt: doc.updatedAt?.toISOString() ?? null,
  };
}

export async function listInjuries(params: ListInjuriesParams) {
  await connectToDatabase();

  const filter: { playerId?: number; status?: InjuryStatus } = {};
  if (params.playerId) {
    filter.playerId = params.playerId;
  }
  if (params.status) {
    filter.status = params.status;
  }

  const skip = (params.page - 1) * params.limit;

  const [items, total] = await Promise.all([
    Injury.find(filter)
      .sort({ startDate: -1, _id: -1 })
      .skip(skip)
      .limit(params.limit)
      .exec(),
    Injury.countDocuments(filter),
  ]);

  return {
    items: items.map((item) => mapInjury(item)),
    total,
  };
}

export async function getInjuryById(id: string) {
  assertValidObjectId(id);
  await connectToDatabase();

  const item = await Injury.findById(id).exec();
  if (!item) {
    return null;
  }

  return mapInjury(item);
}

export async function createInjury(input: CreateInjuryInput) {
  if (!Number.isInteger(input.playerId) || input.playerId <= 0) {
    throw new Error("Invalid player id.");
  }
  if (typeof input.type !== "string" || input.type.trim().length === 0) {
    throw new Error("Injury type is required.");
  }

  const severity = assertSeverity(input.severity);
  const status = input.status ? assertStatus(input.status) : "W trakcie leczenia";
  const startDate = toDateOrNull(input.startDate);

  if (!startDate) {
    throw new Error("Injury startDate is required.");
  }

  const expectedReturnDate = toDateOrNull(input.expectedReturnDate);
  const actualReturnDate = toDateOrNull(input.actualReturnDate);

  await assertPlayerExists(input.playerId);
  await connectToDatabase();

  const created = await Injury.create({
    playerId: input.playerId,
    type: input.type.trim(),
    severity,
    startDate,
    expectedReturnDate,
    actualReturnDate,
    status,
    description: input.description ?? null,
    treatment: input.treatment ?? null,
    reportedBy: input.reportedBy ?? null,
  });

  return mapInjury(created);
}

export async function updateInjury(id: string, input: UpdateInjuryInput) {
  assertValidObjectId(id);

  const payload: Record<string, unknown> = {};

  if (input.playerId !== undefined) {
    if (!Number.isInteger(input.playerId) || input.playerId <= 0) {
      throw new Error("Invalid player id.");
    }
    await assertPlayerExists(input.playerId);
    payload.playerId = input.playerId;
  }

  if (input.type !== undefined) {
    if (typeof input.type !== "string" || input.type.trim().length === 0) {
      throw new Error("Injury type cannot be empty.");
    }
    payload.type = input.type.trim();
  }

  if (input.severity !== undefined) {
    payload.severity = assertSeverity(input.severity);
  }

  if (input.status !== undefined) {
    payload.status = assertStatus(input.status);
  }

  if (input.startDate !== undefined) {
    const parsedStartDate = toDateOrNull(input.startDate);
    if (!parsedStartDate) {
      throw new Error("Injury startDate cannot be null.");
    }
    payload.startDate = parsedStartDate;
  }

  if (input.expectedReturnDate !== undefined) {
    payload.expectedReturnDate = toDateOrNull(input.expectedReturnDate);
  }

  if (input.actualReturnDate !== undefined) {
    payload.actualReturnDate = toDateOrNull(input.actualReturnDate);
  }

  if (input.description !== undefined) {
    payload.description = input.description;
  }

  if (input.treatment !== undefined) {
    payload.treatment = input.treatment;
  }

  if (input.reportedBy !== undefined) {
    payload.reportedBy = input.reportedBy;
  }

  await connectToDatabase();

  const updated = await Injury.findByIdAndUpdate(id, payload, { new: true }).exec();
  if (!updated) {
    return null;
  }

  return mapInjury(updated);
}

export async function deleteInjury(id: string) {
  assertValidObjectId(id);
  await connectToDatabase();

  const deleted = await Injury.findByIdAndDelete(id).exec();
  return deleted !== null;
}
