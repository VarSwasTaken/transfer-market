import { prisma } from "@/lib/prisma";

type AgentProfileResult = {
  data: Record<string, unknown> | null;
  warnings: string[];
};

function decimalToString(value: { toString(): string } | null | undefined) {
  return value ? value.toString() : null;
}

export async function getAgentProfile(agentId: number): Promise<AgentProfileResult> {
  const warnings: string[] = [];

  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    include: {
      players: {
        include: {
          nationality: true,
          club: {
            include: {
              league: {
                include: {
                  nationality: true,
                },
              },
            },
          },
        },
        orderBy: {
          marketValue: "desc",
        },
      },
    },
  });

  if (!agent) {
    return {
      data: null,
      warnings,
    };
  }

  // Calculate stats
  const totalMarketValue = agent.players.reduce(
    (sum, player) => sum + (player.marketValue?.toNumber() ?? 0),
    0
  );

  return {
    data: {
      id: agent.id,
      name: agent.name,
      agency: agent.agency,
      playerCount: agent.players.length,
      totalMarketValue: totalMarketValue.toString(),
      createdAt: agent.createdAt.toISOString(),
      updatedAt: agent.updatedAt.toISOString(),
      players: agent.players.map((player) => ({
        id: player.id,
        firstName: player.firstName,
        lastName: player.lastName,
        position: player.position,
        marketValue: decimalToString(player.marketValue),
        nationality: player.nationality
          ? {
              id: player.nationality.id,
              name: player.nationality.name,
              flagUrl: player.nationality.flagUrl,
            }
          : null,
        club: player.club
          ? {
              id: player.club.id,
              name: player.club.name,
              logoUrl: player.club.logoUrl,
              league: player.club.league
                ? {
                    id: player.club.league.id,
                    name: player.club.league.name,
                    logoUrl: player.club.league.logoUrl,
                  }
                : null,
            }
          : null,
      })),
    },
    warnings,
  };
}
