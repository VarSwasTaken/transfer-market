import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🧨 Czyszczenie danych zawodników...");

  const deletedTransfers = await prisma.transfer.deleteMany();
  const deletedContracts = await prisma.contract.deleteMany();
  const deletedPlayers = await prisma.player.deleteMany();

  console.log(`✅ Usunięto transfery: ${deletedTransfers.count}`);
  console.log(`✅ Usunięto kontrakty: ${deletedContracts.count}`);
  console.log(`✅ Usunięto zawodników: ${deletedPlayers.count}`);
}

main()
  .catch((error) => {
    console.error("❌ Błąd resetu zawodników:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
