import { prisma } from "@/lib/prisma";

type ContractsListInput = {
  page: number;
  limit: number;
  playerId?: number;
};

type ContractsListItem = {
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

type ContractsListResult = {
  data: ContractsListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export async function getContractsList(input: ContractsListInput): Promise<ContractsListResult> {
  const page = Math.max(1, input.page);
  const limit = Math.min(100, Math.max(1, input.limit));
  const skip = (page - 1) * limit;

  const where = {
    playerId: input.playerId,
  };

  const [items, total] = await prisma.$transaction([
    prisma.contract.findMany({
      where,
      skip,
      take: limit,
      orderBy: { endDate: "asc" },
      include: {
        player: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.contract.count({ where }),
  ]);

  return {
    data: items.map((item) => ({
      id: item.id,
      playerId: item.playerId,
      playerName: `${item.player.firstName} ${item.player.lastName}`,
      startDate: item.startDate.toISOString(),
      endDate: item.endDate.toISOString(),
      salary: item.salary.toString(),
      releaseClause: item.releaseClause?.toString() ?? null,
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
