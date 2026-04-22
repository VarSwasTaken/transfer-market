import { prisma } from "@/lib/prisma";

type CreateAgentInput = {
  name: string;
  agency?: string | null;
};

type UpdateAgentInput = Partial<CreateAgentInput>;

type AgentWriteResult = {
  id: number;
  name: string;
  agency: string | null;
  createdAt: string;
  updatedAt: string;
};

function mapAgent(agent: {
  id: number;
  name: string;
  agency: string | null;
  createdAt: Date;
  updatedAt: Date;
}): AgentWriteResult {
  return {
    id: agent.id,
    name: agent.name,
    agency: agent.agency,
    createdAt: agent.createdAt.toISOString(),
    updatedAt: agent.updatedAt.toISOString(),
  };
}

export async function createAgent(input: CreateAgentInput): Promise<AgentWriteResult> {
  const created = await prisma.agent.create({
    data: {
      name: input.name,
      agency: input.agency ?? null,
    },
  });

  return mapAgent(created);
}

export async function updateAgent(id: number, input: UpdateAgentInput): Promise<AgentWriteResult | null> {
  const existing = await prisma.agent.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return null;
  }

  const updated = await prisma.agent.update({
    where: { id },
    data: {
      name: input.name,
      agency: input.agency,
    },
  });

  return mapAgent(updated);
}

export async function deleteAgent(id: number): Promise<boolean | null> {
  const existing = await prisma.agent.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return null;
  }

  const linkedPlayers = await prisma.player.count({ where: { agentId: id } });
  if (linkedPlayers > 0) {
    throw new Error("Cannot delete agent while players are assigned to it.");
  }

  await prisma.agent.delete({ where: { id } });
  return true;
}
