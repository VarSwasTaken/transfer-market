import mongoose from "mongoose";

import ScoutingReport from "@/models/ScoutingReport";

import { connectToDatabase } from "@/lib/mongoose";
import { prisma } from "@/lib/prisma";

const VALID_POTENTIALS = ["Low", "Medium", "High", "World Class"] as const;

type ScoutPotential = (typeof VALID_POTENTIALS)[number];

type ScoutAttributes = {
  pace?: number;
  shooting?: number;
  passing?: number;
  dribbling?: number;
  defending?: number;
  physical?: number;
};

export type ScoutReportDto = {
  id: string;
  playerId: number;
  scoutName: string;
  date: string;
  rating: number | null;
  potential: ScoutPotential | null;
  pros: string[];
  cons: string[];
  notes: string | null;
  attributes: ScoutAttributes | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ListScoutReportsParams = {
  page: number;
  limit: number;
  playerId?: number;
  scoutName?: string;
};

export type CreateScoutReportInput = {
  playerId: number;
  scoutName: string;
  date?: string;
  rating?: number;
  potential?: ScoutPotential;
  pros?: string[];
  cons?: string[];
  notes?: string | null;
  attributes?: ScoutAttributes;
};

export type UpdateScoutReportInput = Partial<CreateScoutReportInput>;

function toDateOrNow(value: string | undefined): Date {
  if (!value) {
    return new Date();
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid report date.");
  }

  return parsed;
}

function assertValidObjectId(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid scouting report id.");
  }
}

function assertPotential(value: unknown): ScoutPotential {
  if (typeof value !== "string" || !VALID_POTENTIALS.includes(value as ScoutPotential)) {
    throw new Error("Invalid scouting potential.");
  }
  return value as ScoutPotential;
}

function normalizeStringArray(value: unknown, fieldName: string): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be an array of strings.`);
  }

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function assertRating(value: unknown): number {
  if (typeof value !== "number" || value < 1 || value > 100) {
    throw new Error("Rating must be a number between 1 and 100.");
  }

  return value;
}

function normalizeAttributes(value: unknown): ScoutAttributes {
  if (!value || typeof value !== "object") {
    throw new Error("Attributes must be an object.");
  }

  const source = value as Record<string, unknown>;
  const keys: Array<keyof ScoutAttributes> = [
    "pace",
    "shooting",
    "passing",
    "dribbling",
    "defending",
    "physical",
  ];

  const attributes: ScoutAttributes = {};

  for (const key of keys) {
    const score = source[key];
    if (score === undefined) {
      continue;
    }

    if (typeof score !== "number" || score < 1 || score > 100) {
      throw new Error(`${key} must be a number between 1 and 100.`);
    }

    attributes[key] = score;
  }

  return attributes;
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

function mapScoutReport(doc: {
  id: string;
  playerId: number;
  scoutName: string;
  date: Date;
  rating?: number;
  potential?: ScoutPotential;
  pros?: string[];
  cons?: string[];
  notes?: string | null;
  attributes?: ScoutAttributes | null;
  createdAt?: Date;
  updatedAt?: Date;
}): ScoutReportDto {
  return {
    id: doc.id,
    playerId: doc.playerId,
    scoutName: doc.scoutName,
    date: doc.date.toISOString(),
    rating: doc.rating ?? null,
    potential: doc.potential ?? null,
    pros: doc.pros ?? [],
    cons: doc.cons ?? [],
    notes: doc.notes ?? null,
    attributes: doc.attributes ?? null,
    createdAt: doc.createdAt?.toISOString() ?? null,
    updatedAt: doc.updatedAt?.toISOString() ?? null,
  };
}

export async function listScoutReports(params: ListScoutReportsParams) {
  await connectToDatabase();

  const filter: { playerId?: number; scoutName?: RegExp } = {};
  if (params.playerId) {
    filter.playerId = params.playerId;
  }
  if (params.scoutName) {
    filter.scoutName = new RegExp(params.scoutName, "i");
  }

  const skip = (params.page - 1) * params.limit;

  const [items, total] = await Promise.all([
    ScoutingReport.find(filter)
      .sort({ date: -1, _id: -1 })
      .skip(skip)
      .limit(params.limit)
      .exec(),
    ScoutingReport.countDocuments(filter),
  ]);

  return {
    items: items.map((item) => mapScoutReport(item)),
    total,
  };
}

export async function getScoutReportById(id: string) {
  assertValidObjectId(id);
  await connectToDatabase();

  const item = await ScoutingReport.findById(id).exec();
  if (!item) {
    return null;
  }

  return mapScoutReport(item);
}

export async function createScoutReport(input: CreateScoutReportInput) {
  if (!Number.isInteger(input.playerId) || input.playerId <= 0) {
    throw new Error("Invalid player id.");
  }
  if (typeof input.scoutName !== "string" || input.scoutName.trim().length === 0) {
    throw new Error("Scout name is required.");
  }

  if (input.rating !== undefined) {
    assertRating(input.rating);
  }

  if (input.potential !== undefined) {
    assertPotential(input.potential);
  }

  if (input.pros !== undefined) {
    normalizeStringArray(input.pros, "pros");
  }

  if (input.cons !== undefined) {
    normalizeStringArray(input.cons, "cons");
  }

  if (input.attributes !== undefined) {
    normalizeAttributes(input.attributes);
  }

  await assertPlayerExists(input.playerId);
  await connectToDatabase();

  const created = await ScoutingReport.create({
    playerId: input.playerId,
    scoutName: input.scoutName.trim(),
    date: toDateOrNow(input.date),
    rating: input.rating,
    potential: input.potential,
    pros: input.pros ?? [],
    cons: input.cons ?? [],
    notes: input.notes ?? null,
    attributes: input.attributes ?? null,
  });

  return mapScoutReport(created);
}

export async function updateScoutReport(id: string, input: UpdateScoutReportInput) {
  assertValidObjectId(id);

  const payload: Record<string, unknown> = {};

  if (input.playerId !== undefined) {
    if (!Number.isInteger(input.playerId) || input.playerId <= 0) {
      throw new Error("Invalid player id.");
    }
    await assertPlayerExists(input.playerId);
    payload.playerId = input.playerId;
  }

  if (input.scoutName !== undefined) {
    if (typeof input.scoutName !== "string" || input.scoutName.trim().length === 0) {
      throw new Error("Scout name cannot be empty.");
    }
    payload.scoutName = input.scoutName.trim();
  }

  if (input.date !== undefined) {
    payload.date = toDateOrNow(input.date);
  }

  if (input.rating !== undefined) {
    payload.rating = assertRating(input.rating);
  }

  if (input.potential !== undefined) {
    payload.potential = assertPotential(input.potential);
  }

  if (input.pros !== undefined) {
    payload.pros = normalizeStringArray(input.pros, "pros");
  }

  if (input.cons !== undefined) {
    payload.cons = normalizeStringArray(input.cons, "cons");
  }

  if (input.notes !== undefined) {
    payload.notes = input.notes;
  }

  if (input.attributes !== undefined) {
    payload.attributes = normalizeAttributes(input.attributes);
  }

  await connectToDatabase();

  const updated = await ScoutingReport.findByIdAndUpdate(id, payload, { new: true }).exec();
  if (!updated) {
    return null;
  }

  return mapScoutReport(updated);
}

export async function deleteScoutReport(id: string) {
  assertValidObjectId(id);
  await connectToDatabase();

  const deleted = await ScoutingReport.findByIdAndDelete(id).exec();
  return deleted !== null;
}
