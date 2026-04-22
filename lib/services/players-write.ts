import { Position, PreferredFoot, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type CreatePlayerInput = {
  firstName: string;
  lastName: string;
  birthDate: string;
  position: Position;
  preferredFoot?: PreferredFoot;
  marketValue: string | number;
  nationalityId: number;
  clubId?: number | null;
  agentId?: number | null;
  height?: number | null;
  weight?: number | null;
  imageUrl?: string | null;
};

type UpdatePlayerInput = Partial<CreatePlayerInput>;

type PlayerWriteResult = {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: string;
  position: Position;
  preferredFoot: PreferredFoot;
  marketValue: string;
  nationalityId: number;
  clubId: number | null;
  agentId: number | null;
  height: number | null;
  weight: number | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

function toDecimal(value: string | number): Prisma.Decimal {
  return new Prisma.Decimal(value);
}

function mapPlayer(player: {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: Date;
  position: Position;
  preferredFoot: PreferredFoot;
  marketValue: Prisma.Decimal;
  nationalityId: number;
  clubId: number | null;
  agentId: number | null;
  height: number | null;
  weight: number | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}): PlayerWriteResult {
  return {
    id: player.id,
    firstName: player.firstName,
    lastName: player.lastName,
    birthDate: player.birthDate.toISOString(),
    position: player.position,
    preferredFoot: player.preferredFoot,
    marketValue: player.marketValue.toString(),
    nationalityId: player.nationalityId,
    clubId: player.clubId,
    agentId: player.agentId,
    height: player.height,
    weight: player.weight,
    imageUrl: player.imageUrl,
    createdAt: player.createdAt.toISOString(),
    updatedAt: player.updatedAt.toISOString(),
  };
}

export async function createPlayer(input: CreatePlayerInput): Promise<PlayerWriteResult> {
  const created = await prisma.player.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      birthDate: new Date(input.birthDate),
      position: input.position,
      preferredFoot: input.preferredFoot ?? PreferredFoot.RIGHT,
      marketValue: toDecimal(input.marketValue),
      nationalityId: input.nationalityId,
      clubId: input.clubId ?? null,
      agentId: input.agentId ?? null,
      height: input.height ?? null,
      weight: input.weight ?? null,
      imageUrl: input.imageUrl ?? null,
    },
  });

  return mapPlayer(created);
}

export async function updatePlayer(id: number, input: UpdatePlayerInput): Promise<PlayerWriteResult | null> {
  const existing = await prisma.player.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return null;
  }

  const updated = await prisma.player.update({
    where: { id },
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      birthDate: input.birthDate ? new Date(input.birthDate) : undefined,
      position: input.position,
      preferredFoot: input.preferredFoot,
      marketValue:
        input.marketValue !== undefined ? toDecimal(input.marketValue) : undefined,
      nationalityId: input.nationalityId,
      clubId: input.clubId,
      agentId: input.agentId,
      height: input.height,
      weight: input.weight,
      imageUrl: input.imageUrl,
    },
  });

  return mapPlayer(updated);
}

export async function deletePlayer(id: number): Promise<boolean | null> {
  const existing = await prisma.player.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return null;
  }

  const linkedContracts = await prisma.contract.count({ where: { playerId: id } });
  const linkedTransfers = await prisma.transfer.count({ where: { playerId: id } });

  if (linkedContracts > 0 || linkedTransfers > 0) {
    throw new Error("Cannot delete player while contracts or transfers exist.");
  }

  await prisma.player.delete({ where: { id } });
  return true;
}
