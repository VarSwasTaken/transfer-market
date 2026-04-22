import { getAgentsList } from "@/lib/services/agents-list";
import { getClubsList } from "@/lib/services/clubs-list";
import { getLeaguesList } from "@/lib/services/leagues-list";
import { getPlayersList } from "@/lib/services/players-list";

export type SearchType = "all" | "players" | "clubs" | "leagues" | "agents";

type GlobalSearchInput = {
  query: string;
  type: SearchType;
  limit: number;
};

type GlobalSearchResult = {
  players: Awaited<ReturnType<typeof getPlayersList>>["data"];
  clubs: Awaited<ReturnType<typeof getClubsList>>["data"];
  leagues: Awaited<ReturnType<typeof getLeaguesList>>["data"];
  agents: Awaited<ReturnType<typeof getAgentsList>>["items"];
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
      agents: [],
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
      agents: [],
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
      agents: [],
    };
  }

  if (input.type === "agents") {
    const agents = await getAgentsList({
      page: 1,
      limit: input.limit,
      search: input.query,
      sortBy: "name",
      sortOrder: "asc",
    });

    return {
      players: [],
      clubs: [],
      leagues: [],
      agents: agents.items,
    };
  }

  const [players, clubs, leagues, agents] = await Promise.all([
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
    getAgentsList({
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
    agents: agents.items,
  };
}
