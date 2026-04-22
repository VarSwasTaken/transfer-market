import { TransferType } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type TransfersListInput = {
  page: number;
  limit: number;
  playerId?: number;
  fromClubId?: number;
  toClubId?: number;
  transferType?: TransferType;
};

type TransfersListItem = {
  id: number;
  playerId: number;
  playerName: string;
  fromClubId: number | null;
  fromClubName: string | null;
  toClubId: number;
  toClubName: string;
  fee: string;
  transferType: TransferType;
  loanEndDate: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
};

type TransfersListResult = {
  data: TransfersListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export async function getTransfersList(input: TransfersListInput): Promise<TransfersListResult> {
  const page = Math.max(1, input.page);
  const limit = Math.min(100, Math.max(1, input.limit));
  const skip = (page - 1) * limit;

  const where = {
    playerId: input.playerId,
    fromClubId: input.fromClubId,
    toClubId: input.toClubId,
    transferType: input.transferType,
  };

  const [items, total] = await prisma.$transaction([
    prisma.transfer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date: "desc" },
      include: {
        player: { select: { firstName: true, lastName: true } },
        fromClub: { select: { name: true } },
        toClub: { select: { name: true } },
      },
    }),
    prisma.transfer.count({ where }),
  ]);

  return {
    data: items.map((item) => ({
      id: item.id,
      playerId: item.playerId,
      playerName: `${item.player.firstName} ${item.player.lastName}`,
      fromClubId: item.fromClubId,
      fromClubName: item.fromClub?.name ?? null,
      toClubId: item.toClubId,
      toClubName: item.toClub.name,
      fee: item.fee.toString(),
      transferType: item.transferType,
      loanEndDate: item.loanEndDate?.toISOString() ?? null,
      date: item.date.toISOString(),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    })),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}
