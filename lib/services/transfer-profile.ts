import { prisma } from "@/lib/prisma";

type TransferProfileData = {
  id: number;
  playerId: number;
  playerName: string;
  fromClubId: number | null;
  fromClubName: string | null;
  toClubId: number;
  toClubName: string;
  fee: string;
  transferType: string;
  date: string;
  createdAt: string;
  updatedAt: string;
};

type TransferProfileResult = {
  data: TransferProfileData | null;
};

export async function getTransferProfile(id: number): Promise<TransferProfileResult> {
  const transfer = await prisma.transfer.findUnique({
    where: { id },
    include: {
      player: { select: { firstName: true, lastName: true } },
      fromClub: { select: { name: true } },
      toClub: { select: { name: true } },
    },
  });

  if (!transfer) {
    return { data: null };
  }

  return {
    data: {
      id: transfer.id,
      playerId: transfer.playerId,
      playerName: `${transfer.player.firstName} ${transfer.player.lastName}`,
      fromClubId: transfer.fromClubId,
      fromClubName: transfer.fromClub?.name ?? null,
      toClubId: transfer.toClubId,
      toClubName: transfer.toClub.name,
      fee: transfer.fee.toString(),
      transferType: transfer.transferType,
      date: transfer.date.toISOString(),
      createdAt: transfer.createdAt.toISOString(),
      updatedAt: transfer.updatedAt.toISOString(),
    },
  };
}
