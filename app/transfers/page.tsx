import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { TransferType } from '@prisma/client';
import TransfersClient from './transfers-client';

export default async function TransfersPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Transfery</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sprawdź wszystkie transfery ostatniego okienka transferowego</p>
      </div>

      <Suspense fallback={<div className="text-center py-12 text-muted-foreground">Loading transfers...</div>}>
        <TransfersClient />
      </Suspense>
    </div>
  );
}
