import { prisma } from "@/lib/prisma";

type ContractProfileData = {
  id: number;
  playerId: number;
  playerName: string;
  startDate: string;
  endDate: string;
  salary: string;
  releaseClause: string | null;
  createdAt: string;
  updatedAt: string;
};

type ContractProfileResult = {
  data: ContractProfileData | null;
};

export async function getContractProfile(id: number): Promise<ContractProfileResult> {
  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      player: { select: { firstName: true, lastName: true } },
    },
  });

  if (!contract) {
    return { data: null };
  }

  return {
    data: {
      id: contract.id,
      playerId: contract.playerId,
      playerName: `${contract.player.firstName} ${contract.player.lastName}`,
      startDate: contract.startDate.toISOString(),
      endDate: contract.endDate.toISOString(),
      salary: contract.salary.toString(),
      releaseClause: contract.releaseClause?.toString() ?? null,
      createdAt: contract.createdAt.toISOString(),
      updatedAt: contract.updatedAt.toISOString(),
    },
  };
}
