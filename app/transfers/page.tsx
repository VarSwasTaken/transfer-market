import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { TransferType } from '@prisma/client';
import TransfersClient from './transfers-client';

export default async function TransfersPage() {
  // Determine the transfer window
  const lastTransfer = await prisma.transfer.findFirst({
    where: { transferType: TransferType.PERMANENT },
    orderBy: { date: 'desc' },
  });

  let windowStart = new Date().toISOString();
  let windowEnd = new Date().toISOString();

  if (lastTransfer) {
    windowEnd = lastTransfer.date.toISOString();
    const ws = new Date(lastTransfer.date);
    ws.setDate(ws.getDate() - 90);
    windowStart = ws.toISOString();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Transfery</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sprawdź wszystkie transfery ostatniego okienka transferowego</p>
      </div>

      <Suspense fallback={<div className="text-center py-12 text-muted-foreground">Loading transfers...</div>}>
        <TransfersClient windowStart={windowStart} windowEnd={windowEnd} />
      </Suspense>
    </div>
  );
}
