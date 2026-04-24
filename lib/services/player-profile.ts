import Injury from '@/models/Injury';

import { connectToDatabase } from '@/lib/mongoose';
import { prisma } from '@/lib/prisma';

const PLAYER_CONTRACTS_LIMIT = 5;
const PLAYER_TRANSFERS_LIMIT = 20;
const NOSQL_TIMEOUT_MS = 700;

type PlayerProfileResult = {
  data: Record<string, unknown> | null;
  warnings: string[];
};

function decimalToString(value: { toString(): string } | null | undefined) {
  return value ? value.toString() : null;
}

export async function getPlayerProfile(playerId: number): Promise<PlayerProfileResult> {
  const warnings: string[] = [];

  const playerPromise = prisma.player.findUnique({
    where: { id: playerId },
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
      agent: true,
      contracts: {
        orderBy: {
          endDate: 'desc',
        },
        take: PLAYER_CONTRACTS_LIMIT,
      },
      transfers: {
        orderBy: {
          date: 'desc',
        },
        take: PLAYER_TRANSFERS_LIMIT,
        include: {
          fromClub: true,
          toClub: true,
        },
      },
    },
  });

  const noSqlTask = (async () => {
    await connectToDatabase();

    const injuryDocs = await Injury.find({ playerId }).sort({ startDate: -1 }).limit(10).exec();

    return injuryDocs.map((doc) => ({
      id: doc.id,
      type: doc.type,
      severity: doc.severity,
      status: doc.status,
      startDate: doc.startDate?.toISOString() ?? null,
      expectedReturnDate: doc.expectedReturnDate?.toISOString() ?? null,
      actualReturnDate: doc.actualReturnDate?.toISOString() ?? null,
      description: doc.description ?? null,
      treatment: doc.treatment ?? null,
      reportedBy: doc.reportedBy ?? null,
      createdAt: doc.createdAt?.toISOString() ?? null,
      updatedAt: doc.updatedAt?.toISOString() ?? null,
    }));
  })();

  const noSqlResult = await Promise.race([noSqlTask.then((items) => ({ kind: 'ok' as const, items })), noSqlTask.catch((error) => ({ kind: 'error' as const, error })), new Promise<{ kind: 'timeout' }>((resolve) => setTimeout(() => resolve({ kind: 'timeout' }), NOSQL_TIMEOUT_MS))]);

  const injuries: Array<Record<string, unknown>> = noSqlResult.kind === 'ok' ? noSqlResult.items : [];

  if (noSqlResult.kind === 'timeout') {
    warnings.push('NoSQL data unavailable: request timed out.');
  } else if (noSqlResult.kind === 'error') {
    const message = noSqlResult.error instanceof Error ? noSqlResult.error.message : 'MongoDB is temporarily unavailable.';
    warnings.push(`NoSQL data unavailable: ${message}`);
  }

  const player = await playerPromise;

  if (!player) {
    return {
      data: null,
      warnings,
    };
  }

  return {
    data: {
      id: player.id,
      firstName: player.firstName,
      lastName: player.lastName,
      birthDate: player.birthDate.toISOString(),
      position: player.position,
      preferredFoot: player.preferredFoot,
      height: player.height,
      weight: player.weight,
      marketValue: decimalToString(player.marketValue),
      imageUrl: player.imageUrl,
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
            budget: decimalToString(player.club.budget),
            league: player.club.league
              ? {
                  id: player.club.league.id,
                  name: player.club.league.name,
                  logoUrl: player.club.league.logoUrl,
                }
              : null,
          }
        : null,
      agent: player.agent
        ? {
            id: player.agent.id,
            name: player.agent.name,
            agency: player.agent.agency,
          }
        : null,
      contracts: player.contracts.map((contract) => ({
        id: contract.id,
        startDate: contract.startDate.toISOString(),
        endDate: contract.endDate.toISOString(),
        salary: decimalToString(contract.salary),
        releaseClause: decimalToString(contract.releaseClause),
      })),
      transfers: player.transfers.map((transfer) => ({
        id: transfer.id,
        date: transfer.date.toISOString(),
        transferType: transfer.transferType,
        fee: decimalToString(transfer.fee),
        fromClub: transfer.fromClub
          ? {
              id: transfer.fromClub.id,
              name: transfer.fromClub.name,
              logoUrl: transfer.fromClub.logoUrl,
            }
          : null,
        toClub: {
          id: transfer.toClub.id,
          name: transfer.toClub.name,
          logoUrl: transfer.toClub.logoUrl,
        },
      })),
      injuries,
    },
    warnings,
  };
}
