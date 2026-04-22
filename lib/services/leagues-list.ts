import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { matchesAnyNormalizedField, normalizeForSearch } from "@/lib/search/normalized-search";

const MAX_LIMIT = 100;

type GetLeaguesListInput = {
  page: number;
  limit: number;
  search?: string;
  nationalityId?: number;
  sortBy: "name" | "createdAt";
  sortOrder: "asc" | "desc";
};

type LeaguesListItem = {
  id: number;
  name: string;
  logoUrl: string | null;
  clubsCount: number;
  nationality: {
    id: number;
    name: string;
    flagUrl: string | null;
  };
};

type LeaguesListResult = {
  data: LeaguesListItem[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
};

const leagueListInclude = {
  nationality: true,
  _count: {
    select: {
      clubs: true,
    },
  },
} satisfies Prisma.LeagueInclude;

type LeagueListRecord = Prisma.LeagueGetPayload<{
  include: typeof leagueListInclude;
}>;

function matchesSearch(league: LeagueListRecord, normalizedSearch: string): boolean {
  if (!normalizedSearch) {
    return true;
  }

  return matchesAnyNormalizedField(normalizedSearch, [
    league.name,
    league.nationality.name,
  ]);
}

export async function getLeaguesList(input: GetLeaguesListInput): Promise<LeaguesListResult> {
  const page = Math.max(1, input.page);
  const limit = Math.min(MAX_LIMIT, Math.max(1, input.limit));
  const skip = (page - 1) * limit;

  const where: Prisma.LeagueWhereInput = input.nationalityId
    ? { nationalityId: input.nationalityId }
    : {};

  const orderBy: Prisma.LeagueOrderByWithRelationInput = {
    [input.sortBy]: input.sortOrder,
  };

  const normalizedSearch = input.search ? normalizeForSearch(input.search) : "";

  let totalItems = 0;
  let leagues: LeagueListRecord[] = [];

  if (!normalizedSearch) {
    const [count, records] = await Promise.all([
      prisma.league.count({ where }),
      prisma.league.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: leagueListInclude,
      }),
    ]);

    totalItems = count;
    leagues = records;
  } else {
    const allLeagues = await prisma.league.findMany({
      where,
      orderBy,
      include: leagueListInclude,
    });

    const filtered = allLeagues.filter((league) => matchesSearch(league, normalizedSearch));

    totalItems = filtered.length;
    leagues = filtered.slice(skip, skip + limit);
  }

  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);

  return {
    data: leagues.map((league) => ({
      id: league.id,
      name: league.name,
      logoUrl: league.logoUrl,
      clubsCount: league._count.clubs,
      nationality: {
        id: league.nationality.id,
        name: league.nationality.name,
        flagUrl: league.nationality.flagUrl,
      },
    })),
    meta: {
      page,
      limit,
      totalItems,
      totalPages,
    },
  };
}
