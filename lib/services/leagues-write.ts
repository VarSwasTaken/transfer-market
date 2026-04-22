import { prisma } from "@/lib/prisma";

type CreateLeagueInput = {
  name: string;
  nationalityId: number;
  logoUrl?: string | null;
};

type UpdateLeagueInput = Partial<CreateLeagueInput>;

type LeagueWriteResult = {
  id: number;
  name: string;
  nationalityId: number;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

function mapLeague(league: {
  id: number;
  name: string;
  nationalityId: number;
  logoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}): LeagueWriteResult {
  return {
    id: league.id,
    name: league.name,
    nationalityId: league.nationalityId,
    logoUrl: league.logoUrl,
    createdAt: league.createdAt.toISOString(),
    updatedAt: league.updatedAt.toISOString(),
  };
}

export async function createLeague(input: CreateLeagueInput): Promise<LeagueWriteResult> {
  const created = await prisma.league.create({
    data: {
      name: input.name,
      nationalityId: input.nationalityId,
      logoUrl: input.logoUrl ?? null,
    },
  });

  return mapLeague(created);
}

export async function updateLeague(
  id: number,
  input: UpdateLeagueInput,
): Promise<LeagueWriteResult | null> {
  const existing = await prisma.league.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return null;
  }

  const updated = await prisma.league.update({
    where: { id },
    data: {
      name: input.name,
      nationalityId: input.nationalityId,
      logoUrl: input.logoUrl,
    },
  });

  return mapLeague(updated);
}

export async function deleteLeague(id: number): Promise<boolean | null> {
  const existing = await prisma.league.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return null;
  }

  const linkedClubs = await prisma.club.count({ where: { leagueId: id } });
  if (linkedClubs > 0) {
    throw new Error("Cannot delete league while clubs are assigned to it.");
  }

  await prisma.league.delete({ where: { id } });
  return true;
}
