import { prisma } from "@/lib/prisma";
import { matchesAnyNormalizedField } from "@/lib/search/normalized-search";

type GetAgentsListInput = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "name" | "createdAt";
  sortOrder?: "asc" | "desc";
};

type AgentsListItem = {
  id: number;
  name: string;
  agency: string | null;
  playerCount: number;
  createdAt: string;
};

export async function getAgentsList(input: GetAgentsListInput): Promise<{
  items: AgentsListItem[];
  total: number;
}> {
  const page = Math.max(1, input.page ?? 1);
  const limit = Math.min(100, Math.max(1, input.limit ?? 20));
  const sortBy = input.sortBy ?? "name";
  const sortOrder = input.sortOrder ?? "asc";

  // Fetch all agents with player counts
  const allAgents = await prisma.agent.findMany({
    include: {
      _count: {
        select: { players: true },
      },
    },
  });

  // Filter by search if provided
  let filteredAgents = allAgents;
  if (input.search) {
    const searchTerm = input.search.toLowerCase();
    filteredAgents = allAgents.filter((agent) =>
      matchesAnyNormalizedField(searchTerm, [agent.name, agent.agency ?? ""])
    );
  }

  // Sort
  filteredAgents.sort((a, b) => {
    let aVal: string | number;
    let bVal: string | number;

    if (sortBy === "name") {
      aVal = a.name.toLowerCase();
      bVal = b.name.toLowerCase();
    } else {
      aVal = new Date(a.createdAt).getTime();
      bVal = new Date(b.createdAt).getTime();
    }

    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Paginate
  const total = filteredAgents.length;
  const start = (page - 1) * limit;
  const paginatedAgents = filteredAgents.slice(start, start + limit);

  const items: AgentsListItem[] = paginatedAgents.map((agent) => ({
    id: agent.id,
    name: agent.name,
    agency: agent.agency,
    playerCount: agent._count.players,
    createdAt: agent.createdAt.toISOString(),
  }));

  return { items, total };
}
