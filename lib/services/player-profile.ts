import Injury from "@/models/Injury";
import ScoutingReport from "@/models/ScoutingReport";

import { connectToDatabase } from "@/lib/mongoose";
import { prisma } from "@/lib/prisma";

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
          endDate: "desc",
        },
      },
      transfers: {
        orderBy: {
          date: "desc",
        },
        include: {
          fromClub: true,
          toClub: true,
        },
      },
    },
  });

  let scoutingReports: Array<Record<string, unknown>> = [];
  let injuries: Array<Record<string, unknown>> = [];

  try {
    await connectToDatabase();

    const [scoutingDocs, injuryDocs] = await Promise.all([
      ScoutingReport.find({ playerId }).sort({ date: -1 }).limit(10).exec(),
      Injury.find({ playerId }).sort({ startDate: -1 }).limit(10).exec(),
    ]);

    scoutingReports = scoutingDocs.map((doc) => ({
      id: doc.id,
      scoutName: doc.scoutName,
      date: doc.date?.toISOString() ?? null,
      rating: doc.rating ?? null,
      potential: doc.potential ?? null,
      pros: doc.pros ?? [],
      cons: doc.cons ?? [],
      notes: doc.notes ?? null,
      attributes: doc.attributes ?? null,
      createdAt: doc.createdAt?.toISOString() ?? null,
      updatedAt: doc.updatedAt?.toISOString() ?? null,
    }));

    injuries = injuryDocs.map((doc) => ({
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
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "MongoDB is temporarily unavailable.";
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
            }
          : null,
        toClub: {
          id: transfer.toClub.id,
          name: transfer.toClub.name,
        },
      })),
      scoutingReports,
      injuries,
    },
    warnings,
  };
}
