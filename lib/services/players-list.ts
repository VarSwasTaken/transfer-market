import { Position, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { matchesAnyNormalizedField, normalizeForSearch } from "@/lib/search/normalized-search";

const MAX_LIMIT = 100;

type GetPlayersListInput = {
  page: number;
  limit: number;
  search?: string;
  position?: Position;
  clubId?: number;
  leagueId?: number;
  nationalityId?: number;
  sortBy: "marketValue" | "lastName" | "createdAt";
  sortOrder: "asc" | "desc";
};

type PlayersListItem = {
  id: number;
  firstName: string;
  lastName: string;
  position: Position;
  marketValue: string;
  imageUrl: string | null;
  nationality: {
    id: number;
    name: string;
    flagUrl: string | null;
  } | null;
  club: {
    id: number;
    name: string;
    logoUrl: string | null;
    league: {
      id: number;
      name: string;
    } | null;
  } | null;
};

type PlayersListResult = {
  data: PlayersListItem[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
};

const playerListInclude = {
  nationality: true,
  club: {
    include: {
      league: true,
    },
  },
} satisfies Prisma.PlayerInclude;

type PlayerListRecord = Prisma.PlayerGetPayload<{
  include: typeof playerListInclude;
}>;

function matchesSearch(firstName: string, lastName: string, normalizedSearch: string): boolean {
  if (!normalizedSearch) {
    return true;
  }

  return matchesAnyNormalizedField(normalizedSearch, [
    firstName,
    lastName,
    `${firstName} ${lastName}`.trim(),
  ]);
}

function toDecimalString(value: Prisma.Decimal): string {
  return value.toString();
}

export async function getPlayersList(input: GetPlayersListInput): Promise<PlayersListResult> {
  const page = Math.max(1, input.page);
  const limit = Math.min(MAX_LIMIT, Math.max(1, input.limit));
  const skip = (page - 1) * limit;

  const andConditions: Prisma.PlayerWhereInput[] = [];

  if (input.position) {
    andConditions.push({ position: input.position });
  }

  if (input.clubId) {
    andConditions.push({ clubId: input.clubId });
  }

  if (input.leagueId) {
    andConditions.push({ club: { leagueId: input.leagueId } });
  }

  if (input.nationalityId) {
    andConditions.push({ nationalityId: input.nationalityId });
  }

  const where: Prisma.PlayerWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const orderBy: Prisma.PlayerOrderByWithRelationInput = {
    [input.sortBy]: input.sortOrder,
  };

  const normalizedSearch = input.search ? normalizeForSearch(input.search) : "";

  let totalItems = 0;
  let players: PlayerListRecord[] = [];

  if (!normalizedSearch) {
    const [count, records] = await Promise.all([
      prisma.player.count({ where }),
      prisma.player.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: playerListInclude,
      }),
    ]);

    totalItems = count;
    players = records;
  } else {
    const allPlayers = await prisma.player.findMany({
      where,
      orderBy,
      include: playerListInclude,
    });

    const filteredPlayers = allPlayers.filter((player) =>
      matchesSearch(player.firstName, player.lastName, normalizedSearch),
    );

    totalItems = filteredPlayers.length;
    players = filteredPlayers.slice(skip, skip + limit);
  }

  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);

  return {
    data: players.map((player) => ({
      id: player.id,
      firstName: player.firstName,
      lastName: player.lastName,
      position: player.position,
      marketValue: toDecimalString(player.marketValue),
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
            league: player.club.league
              ? {
                  id: player.club.league.id,
                  name: player.club.league.name,
                }
              : null,
          }
        : null,
    })),
    meta: {
      page,
      limit,
      totalItems,
      totalPages,
    },
  };
}
