'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function saveTransferAction(formData: FormData) {
  const idStr = formData.get('id') as string | null;
  const playerIdStr = formData.get('playerId') as string;
  const fromClubIdStr = formData.get('fromClubId') as string;
  const toClubIdStr = formData.get('toClubId') as string;
  const feeStr = formData.get('fee') as string;
  const transferType = formData.get('transferType') as 'PERMANENT' | 'LOAN' | 'FREE';
  const loanEndDateStr = formData.get('loanEndDate') as string;
  const dateStr = formData.get('date') as string;

  if (!playerIdStr || !toClubIdStr || !transferType || !dateStr || !feeStr) {
    throw new Error('Dostarcz wymagane dane (Zawodnik, Klub Docelowy, Kwota, Typ, Data).');
  }

  const data = {
    playerId: Number(playerIdStr),
    fromClubId: fromClubIdStr ? Number(fromClubIdStr) : null,
    toClubId: Number(toClubIdStr),
    fee: Number(feeStr),
    transferType,
    loanEndDate: loanEndDateStr ? new Date(loanEndDateStr) : null,
    date: new Date(dateStr),
  };

  // 1. Zapis transferu do bazy (nowy lub aktualizacja istniejącego)
  if (idStr) {
    await prisma.transfer.update({
      where: { id: Number(idStr) },
      data,
    });
  } else {
    await prisma.transfer.create({
      data,
    });
  }

  // 2. Aktualizacja przypisanego klubu u zawodnika
  await prisma.player.update({
    where: { id: data.playerId },
    data: { clubId: data.toClubId },
  });

  // 3. Wymuszenie odświeżenia WSZYSTKICH stron na froncie (cache)
  revalidatePath('/', 'layout');

  redirect('/admin/transfers');
}

export async function deleteTransferAction(formData: FormData) {
  const idStr = formData.get('id') as string;
  if (!idStr) return;

  await prisma.transfer.delete({
    where: { id: Number(idStr) },
  });

  // Przy usuwaniu transferu również warto mocno wyczyścić cache
  revalidatePath('/', 'layout');
}
