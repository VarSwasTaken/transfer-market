import { prisma } from "@/lib/prisma";

type LeagueProfileResult = {
  data: Record<string, unknown> | null;
  warnings: string[];
};

function decimalToString(value: { toString(): string } | null | undefined) {
  return value ? value.toString() : null;
}

export async function getLeagueProfile(leagueId: number): Promise<LeagueProfileResult> {
  const warnings: string[] = [];

  const league = await prisma.league.findUnique({
    where: { id: leagueId },
    include: {
      nationality: true,
      clubs: {
        include: {
          _count: {
            select: { players: true },
          },
        },
        orderBy: {
          budget: "desc",
        },
      },
    },
  });

  if (!league) {
    return {
      data: null,
      warnings,
    };
  }

  // Get all players in the league via clubs
  const allPlayersInLeague = await prisma.player.findMany({
    where: {
      club: {
        leagueId: leagueId,
      },
    },
  });

  const totalMarketValue = allPlayersInLeague.reduce(
    (sum, player) => sum + (player.marketValue?.toNumber() ?? 0),
    0
  );
  const avgMarketValue =
    allPlayersInLeague.length > 0 ? totalMarketValue / allPlayersInLeague.length : 0;

  return {
    data: {
      id: league.id,
      name: league.name,
      logoUrl: league.logoUrl,
      createdAt: league.createdAt.toISOString(),
      updatedAt: league.updatedAt.toISOString(),
      nationality: league.nationality
        ? {
            id: league.nationality.id,
            name: league.nationality.name,
            flagUrl: league.nationality.flagUrl,
          }
        : null,
      stats: {
        clubCount: league.clubs.length,
        playerCount: allPlayersInLeague.length,
        totalMarketValue: totalMarketValue.toString(),
        avgMarketValue: avgMarketValue.toString(),
      },
      clubs: league.clubs.map((club) => ({
        id: club.id,
        name: club.name,
        logoUrl: club.logoUrl,
        budget: decimalToString(club.budget),
        playerCount: club._count.players,
      })),
    },
    warnings,
  };
}
