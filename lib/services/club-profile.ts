import { prisma } from '@/lib/prisma';

type ClubProfileResult = {
  data: Record<string, unknown> | null;
  warnings: string[];
};

function decimalToString(value: { toString(): string } | null | undefined) {
  return value ? value.toString() : null;
}

export async function getClubProfile(clubId: number): Promise<ClubProfileResult> {
  const warnings: string[] = [];

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    include: {
      league: {
        include: {
          nationality: true,
        },
      },
      players: {
        include: {
          nationality: true,
          agent: true,
        },
        orderBy: {
          marketValue: 'desc',
        },
      },
      transfersIn: {
        include: {
          player: {
            include: {
              nationality: true,
            },
          },
          fromClub: true,
        },
        orderBy: {
          date: 'desc',
        },
        take: 10,
      },
      transfersOut: {
        include: {
          player: {
            include: {
              nationality: true,
            },
          },
          toClub: true,
        },
        orderBy: {
          date: 'desc',
        },
        take: 10,
      },
    },
  });

  if (!club) {
    return {
      data: null,
      warnings,
    };
  }

  // Calculate stats
  const totalMarketValue = club.players.reduce((sum, player) => sum + (player.marketValue?.toNumber() ?? 0), 0);
  const avgMarketValue = club.players.length > 0 ? totalMarketValue / club.players.length : 0;

  return {
    data: {
      id: club.id,
      name: club.name,
      logoUrl: club.logoUrl,
      budget: decimalToString(club.budget),
      createdAt: club.createdAt.toISOString(),
      updatedAt: club.updatedAt.toISOString(),
      league: club.league
        ? {
            id: club.league.id,
            name: club.league.name,
            logoUrl: club.league.logoUrl,
            nationality: club.league.nationality
              ? {
                  id: club.league.nationality.id,
                  name: club.league.nationality.name,
                  namePL: club.league.nationality.name_PL,
                  flagUrl: club.league.nationality.flagUrl,
                }
              : null,
          }
        : null,
      stats: {
        playerCount: club.players.length,
        totalMarketValue: totalMarketValue.toString(),
        avgMarketValue: avgMarketValue.toString(),
      },
      players: club.players.map((player) => ({
        id: player.id,
        firstName: player.firstName,
        lastName: player.lastName,
        shirtNumber: player.shirtNumber,
        position: player.position,
        marketValue: decimalToString(player.marketValue),
        nationality: player.nationality
          ? {
              id: player.nationality.id,
              name: player.nationality.name,
              namePL: player.nationality.name_PL,
              flagUrl: player.nationality.flagUrl,
            }
          : null,
        agent: player.agent
          ? {
              id: player.agent.id,
              name: player.agent.name,
              agency: player.agent.agency,
            }
          : null,
      })),
      transfersIn: club.transfersIn.map((transfer) => ({
        id: transfer.id,
        player: {
          id: transfer.player.id,
          firstName: transfer.player.firstName,
          lastName: transfer.player.lastName,
          nationality: transfer.player.nationality
            ? {
                id: transfer.player.nationality.id,
                name: transfer.player.nationality.name,
                namePL: transfer.player.nationality.name_PL,
                flagUrl: transfer.player.nationality.flagUrl,
              }
            : null,
        },
        fromClub: transfer.fromClub
          ? {
              id: transfer.fromClub.id,
              name: transfer.fromClub.name,
              logoUrl: transfer.fromClub.logoUrl,
            }
          : null,
        fee: decimalToString(transfer.fee),
        transferType: transfer.transferType,
        date: transfer.date.toISOString(),
      })),
      transfersOut: club.transfersOut.map((transfer) => ({
        id: transfer.id,
        player: {
          id: transfer.player.id,
          firstName: transfer.player.firstName,
          lastName: transfer.player.lastName,
          nationality: transfer.player.nationality
            ? {
                id: transfer.player.nationality.id,
                name: transfer.player.nationality.name,
                namePL: transfer.player.nationality.name_PL,
                flagUrl: transfer.player.nationality.flagUrl,
              }
            : null,
        },
        toClub: {
          id: transfer.toClub.id,
          name: transfer.toClub.name,
          logoUrl: transfer.toClub.logoUrl,
        },
        fee: decimalToString(transfer.fee),
        transferType: transfer.transferType,
        date: transfer.date.toISOString(),
      })),
    },
    warnings,
  };
}
