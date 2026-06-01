import { prisma } from '@/lib/prisma';
import { connectToDatabase } from '@/lib/mongoose';
import ClubValuation from '@/models/ClubValuation';

type ClubProfileResult = {
  data: Record<string, unknown> | null;
  warnings: string[];
};

function decimalToString(value: { toString(): string } | null | undefined) {
  return value ? value.toString() : null;
}

export async function getClubProfile(clubId: number): Promise<ClubProfileResult> {
  const warnings: string[] = [];

  const clubQuery = prisma.club.findUnique({
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
        },
        orderBy: {
          marketValue: 'desc',
        },
        take: 50,
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

  const club = (await Promise.race([clubQuery, new Promise((_, reject) => setTimeout(() => reject(new Error('Club query timed out')), 3000))])) as Awaited<typeof clubQuery>;

  if (!club) {
    return {
      data: null,
      warnings,
    };
  }

  // Calculate stats
  const totalMarketValue = club.players.reduce((sum, player) => sum + (player.marketValue?.toNumber() ?? 0), 0);
  const avgMarketValue = club.players.length > 0 ? totalMarketValue / club.players.length : 0;

  // Squad value history (from ClubValuation for past years + current year from marketValue sum)
  let squadValueHistory: Array<{ year: number; value: number }> = [];
  try {
    await connectToDatabase();
    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 15; // Last 15 years

    // Get historical club valuations from MongoDB (last 15 years)
    const clubVals = await ClubValuation.find({ clubId, year: { $gte: minYear } }).sort({ year: 1 });

    // Build map: year -> value
    const valuesByYear = new Map<number, number>();
    for (const cv of clubVals) {
      valuesByYear.set(cv.year, Math.round(cv.value / 1_000_000)); // Convert to millions
    }

    // For current year, use sum of player marketValue from Supabase
    const currentYearSum = club.players.reduce((sum, player) => sum + (player.marketValue?.toNumber() ?? 0), 0);
    if (currentYearSum > 0) {
      valuesByYear.set(currentYear, Math.round(currentYearSum / 1_000_000));
    }

    // Convert to sorted array
    squadValueHistory = Array.from(valuesByYear.entries())
      .map(([year, value]) => ({ year, value }))
      .sort((a, b) => a.year - b.year);
  } catch {
    // silent - keep squadValueHistory empty and return warnings
    warnings.push('Unable to load squad value history from NoSQL.');
  }

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
        imageUrl: player.imageUrl, // <--- TUTAJ DODAĆ TĄ LINIJKĘ!
        nationality: player.nationality
          ? {
              id: player.nationality.id,
              name: player.nationality.name,
              namePL: player.nationality.name_PL,
              flagUrl: player.nationality.flagUrl,
            }
          : null,
      })),
      squadValueHistory,
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
