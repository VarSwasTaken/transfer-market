import { prisma } from '@/lib/prisma';
import { TransferForm } from '../TransferForm';

export default async function NewTransferPage() {
  const [players, clubs] = await Promise.all([
    prisma.player.findMany({
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        clubId: true, // <--- DOKŁADNIE TUTAJ DODANE
      },
    }),
    prisma.club.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-emerald-500">Dodaj Transfer</h1>
      <TransferForm players={players} clubs={clubs} />
    </div>
  );
}
