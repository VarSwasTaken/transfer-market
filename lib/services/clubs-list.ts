import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { matchesAnyNormalizedField, normalizeForSearch } from "@/lib/search/normalized-search";

const MAX_LIMIT = 100;

type GetClubsListInput = {
  page: number;
  limit: number;
  search?: string;
  leagueId?: number;
  nationalityId?: number;
  sortBy: "name" | "budget" | "createdAt";
  sortOrder: "asc" | "desc";
};

type ClubsListItem = {
  id: number;
  name: string;
  logoUrl: string | null;
  budget: string;
  league: {
    id: number;
    name: string;
    logoUrl: string | null;
    nationality: {
      id: number;
      name: string;
      flagUrl: string | null;
    };
  };
};

type ClubsListResult = {
  data: ClubsListItem[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
};

const clubListInclude = {
  league: {
    include: {
      nationality: true,
    },
  },
} satisfies Prisma.ClubInclude;

type ClubListRecord = Prisma.ClubGetPayload<{
  include: typeof clubListInclude;
}>;

function toDecimalString(value: Prisma.Decimal): string {
  return value.toString();
}

function matchesSearch(club: ClubListRecord, normalizedSearch: string): boolean {
  if (!normalizedSearch) {
    return true;
  }

  return matchesAnyNormalizedField(normalizedSearch, [
    club.name,
    club.league.name,
    club.league.nationality.name,
  ]);
}

export async function getClubsList(input: GetClubsListInput): Promise<ClubsListResult> {
  const page = Math.max(1, input.page);
  const limit = Math.min(MAX_LIMIT, Math.max(1, input.limit));
  const skip = (page - 1) * limit;

  const andConditions: Prisma.ClubWhereInput[] = [];

  if (input.leagueId) {
    andConditions.push({ leagueId: input.leagueId });
  }

  if (input.nationalityId) {
    andConditions.push({ league: { nationalityId: input.nationalityId } });
  }

  const where: Prisma.ClubWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const orderBy: Prisma.ClubOrderByWithRelationInput = {
    [input.sortBy]: input.sortOrder,
  };

  const normalizedSearch = input.search ? normalizeForSearch(input.search) : "";

  let totalItems = 0;
  let clubs: ClubListRecord[] = [];

  if (!normalizedSearch) {
    const [count, records] = await Promise.all([
      prisma.club.count({ where }),
      prisma.club.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: clubListInclude,
      }),
    ]);

    totalItems = count;
    clubs = records;
  } else {
    const allClubs = await prisma.club.findMany({
      where,
      orderBy,
      include: clubListInclude,
    });

    const filtered = allClubs.filter((club) => matchesSearch(club, normalizedSearch));

    totalItems = filtered.length;
    clubs = filtered.slice(skip, skip + limit);
  }

  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);

  return {
    data: clubs.map((club) => ({
      id: club.id,
      name: club.name,
      logoUrl: club.logoUrl,
      budget: toDecimalString(club.budget),
      league: {
        id: club.league.id,
        name: club.league.name,
        logoUrl: club.league.logoUrl,
        nationality: {
          id: club.league.nationality.id,
          name: club.league.nationality.name,
          flagUrl: club.league.nationality.flagUrl,
        },
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
