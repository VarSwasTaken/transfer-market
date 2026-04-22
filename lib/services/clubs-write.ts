import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type CreateClubInput = {
  name: string;
  budget: string | number;
  leagueId: number;
  logoUrl?: string | null;
};

type UpdateClubInput = Partial<CreateClubInput>;

type ClubWriteResult = {
  id: number;
  name: string;
  budget: string;
  leagueId: number;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

function toDecimal(value: string | number): Prisma.Decimal {
  return new Prisma.Decimal(value);
}

function mapClub(club: {
  id: number;
  name: string;
  budget: Prisma.Decimal;
  leagueId: number;
  logoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}): ClubWriteResult {
  return {
    id: club.id,
    name: club.name,
    budget: club.budget.toString(),
    leagueId: club.leagueId,
    logoUrl: club.logoUrl,
    createdAt: club.createdAt.toISOString(),
    updatedAt: club.updatedAt.toISOString(),
  };
}

export async function createClub(input: CreateClubInput): Promise<ClubWriteResult> {
  const created = await prisma.club.create({
    data: {
      name: input.name,
      budget: toDecimal(input.budget),
      leagueId: input.leagueId,
      logoUrl: input.logoUrl ?? null,
    },
  });

  return mapClub(created);
}

export async function updateClub(id: number, input: UpdateClubInput): Promise<ClubWriteResult | null> {
  const existing = await prisma.club.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return null;
  }

  const updated = await prisma.club.update({
    where: { id },
    data: {
      name: input.name,
      budget: input.budget !== undefined ? toDecimal(input.budget) : undefined,
      leagueId: input.leagueId,
      logoUrl: input.logoUrl,
    },
  });

  return mapClub(updated);
}
