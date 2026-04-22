import { getClubsList } from "@/lib/services/clubs-list";
import { getLeaguesList } from "@/lib/services/leagues-list";
import { getPlayersList } from "@/lib/services/players-list";

export type SearchType = "all" | "players" | "clubs" | "leagues";

type GlobalSearchInput = {
  query: string;
  type: SearchType;
  limit: number;
};

type GlobalSearchResult = {
  players: Awaited<ReturnType<typeof getPlayersList>>["data"];
  clubs: Awaited<ReturnType<typeof getClubsList>>["data"];
  leagues: Awaited<ReturnType<typeof getLeaguesList>>["data"];
};

export async function getGlobalSearch(input: GlobalSearchInput): Promise<GlobalSearchResult> {
  if (input.type === "players") {
    const players = await getPlayersList({
      page: 1,
      limit: input.limit,
      search: input.query,
      sortBy: "lastName",
      sortOrder: "asc",
    });

    return {
      players: players.data,
      clubs: [],
      leagues: [],
    };
  }

  if (input.type === "clubs") {
    const clubs = await getClubsList({
      page: 1,
      limit: input.limit,
      search: input.query,
      sortBy: "name",
      sortOrder: "asc",
    });

    return {
      players: [],
      clubs: clubs.data,
      leagues: [],
    };
  }

  if (input.type === "leagues") {
    const leagues = await getLeaguesList({
      page: 1,
      limit: input.limit,
      search: input.query,
      sortBy: "name",
      sortOrder: "asc",
    });

    return {
      players: [],
      clubs: [],
      leagues: leagues.data,
    };
  }

  const [players, clubs, leagues] = await Promise.all([
    getPlayersList({
      page: 1,
      limit: input.limit,
      search: input.query,
      sortBy: "lastName",
      sortOrder: "asc",
    }),
    getClubsList({
      page: 1,
      limit: input.limit,
      search: input.query,
      sortBy: "name",
      sortOrder: "asc",
    }),
    getLeaguesList({
      page: 1,
      limit: input.limit,
      search: input.query,
      sortBy: "name",
      sortOrder: "asc",
    }),
  ]);

  return {
    players: players.data,
    clubs: clubs.data,
    leagues: leagues.data,
  };
}
