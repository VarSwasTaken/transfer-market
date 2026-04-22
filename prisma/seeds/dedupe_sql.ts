import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const toKeyDate = (date: Date) => date.toISOString().slice(0, 10);

async function dedupeAgents() {
  const agents = await prisma.agent.findMany({
    orderBy: { id: "asc" },
  });

  const groups = new Map<string, number[]>();
  for (const agent of agents) {
    const key = agent.name.trim().toLowerCase();
    const ids = groups.get(key) ?? [];
    ids.push(agent.id);
    groups.set(key, ids);
  }

  let removed = 0;

  for (const ids of groups.values()) {
    if (ids.length <= 1) {
      continue;
    }

    const keepId = ids[0];
    const duplicateIds = ids.slice(1);

    for (const duplicateId of duplicateIds) {
      await prisma.player.updateMany({
        where: { agentId: duplicateId },
        data: { agentId: keepId },
      });

      await prisma.agent.delete({ where: { id: duplicateId } });
      removed += 1;
    }
  }

  console.log(`🧹 Agenci: usunięto duplikaty: ${removed}`);
}

async function dedupePlayersAndRelations() {
  const players = await prisma.player.findMany({
    orderBy: { id: "asc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      birthDate: true,
    },
  });

  const groups = new Map<string, number[]>();
  for (const player of players) {
    const key = `${player.firstName.trim().toLowerCase()}|${player.lastName
      .trim()
      .toLowerCase()}|${toKeyDate(player.birthDate)}`;
    const ids = groups.get(key) ?? [];
    ids.push(player.id);
    groups.set(key, ids);
  }

  let removedPlayers = 0;

  for (const ids of groups.values()) {
    if (ids.length <= 1) {
      continue;
    }

    const keepId = ids[0];
    const duplicateIds = ids.slice(1);

    for (const duplicateId of duplicateIds) {
      await prisma.contract.updateMany({
        where: { playerId: duplicateId },
        data: { playerId: keepId },
      });

      await prisma.transfer.updateMany({
        where: { playerId: duplicateId },
        data: { playerId: keepId },
      });

      await prisma.player.delete({ where: { id: duplicateId } });
      removedPlayers += 1;
    }
  }

  console.log(`🧹 Zawodnicy: usunięto duplikaty: ${removedPlayers}`);
}

async function dedupeContracts() {
  const contracts = await prisma.contract.findMany({
    orderBy: { id: "asc" },
    select: {
      id: true,
      playerId: true,
      startDate: true,
      endDate: true,
    },
  });

  const groups = new Map<string, number[]>();
  for (const contract of contracts) {
    const key = `${contract.playerId}|${toKeyDate(contract.startDate)}|${toKeyDate(contract.endDate)}`;
    const ids = groups.get(key) ?? [];
    ids.push(contract.id);
    groups.set(key, ids);
  }

  let removed = 0;

  for (const ids of groups.values()) {
    if (ids.length <= 1) {
      continue;
    }

    const duplicates = ids.slice(1);
    await prisma.contract.deleteMany({ where: { id: { in: duplicates } } });
    removed += duplicates.length;
  }

  console.log(`🧹 Kontrakty: usunięto duplikaty: ${removed}`);
}

async function dedupeTransfers() {
  const transfers = await prisma.transfer.findMany({
    orderBy: { id: "asc" },
    select: {
      id: true,
      playerId: true,
      fromClubId: true,
      toClubId: true,
      date: true,
      transferType: true,
      fee: true,
    },
  });

  const groups = new Map<string, number[]>();
  for (const transfer of transfers) {
    const key = `${transfer.playerId}|${transfer.fromClubId ?? "null"}|${transfer.toClubId}|${toKeyDate(
      transfer.date,
    )}|${transfer.transferType}|${transfer.fee.toString()}`;
    const ids = groups.get(key) ?? [];
    ids.push(transfer.id);
    groups.set(key, ids);
  }

  let removed = 0;

  for (const ids of groups.values()) {
    if (ids.length <= 1) {
      continue;
    }

    const duplicates = ids.slice(1);
    await prisma.transfer.deleteMany({ where: { id: { in: duplicates } } });
    removed += duplicates.length;
  }

  console.log(`🧹 Transfery: usunięto duplikaty: ${removed}`);
}

async function main() {
  console.log("🚀 Start deduplikacji SQL...");

  await dedupeAgents();
  await dedupePlayersAndRelations();
  await dedupeContracts();
  await dedupeTransfers();

  console.log("✅ Deduplikacja SQL zakończona.");
}

main()
  .catch((error) => {
    console.error("❌ Błąd deduplikacji:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
