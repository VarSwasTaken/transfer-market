'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function savePlayerAction(formData: FormData) {
  const idStr = formData.get('id') as string | null;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const birthDateStr = formData.get('birthDate') as string;
  const shirtNumberStr = formData.get('shirtNumber') as string;
  const heightStr = formData.get('height') as string;
  const weightStr = formData.get('weight') as string;
  const position = formData.get('position') as 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD'; // Position enum
  const preferredFoot = formData.get('preferredFoot') as 'LEFT' | 'RIGHT' | 'BOTH'; // PreferredFoot enum
  const marketValueStr = formData.get('marketValue') as string;
  const imageUrl = formData.get('imageUrl') as string;
  const nationalityIdStr = formData.get('nationalityId') as string;
  const clubIdStr = formData.get('clubId') as string;
  const agentIdStr = formData.get('agentId') as string;

  // Usunięto !lastName z walidacji
  if (!firstName || !birthDateStr || !shirtNumberStr || !position || !marketValueStr || !nationalityIdStr) {
    throw new Error('Wypełnij wymagane pola (Imię, Data ur., Numer, Pozycja, Wartość rynkowa i Kraj).');
  }

  const data = {
    firstName,
    lastName: lastName || '', // Zapisuje pusty string, jeśli nie podano nazwiska
    birthDate: new Date(birthDateStr),
    shirtNumber: Number(shirtNumberStr),
    position,
    preferredFoot: preferredFoot || 'RIGHT',
    marketValue: Number(marketValueStr),
    imageUrl: imageUrl || null,
    nationalityId: Number(nationalityIdStr),
    clubId: clubIdStr ? Number(clubIdStr) : null,
    agentId: agentIdStr ? Number(agentIdStr) : null,
    height: heightStr ? Number(heightStr) : null,
    weight: weightStr ? Number(weightStr) : null,
  };

  try {
    if (idStr) {
      await prisma.player.update({
        where: { id: Number(idStr) },
        data,
      });
    } else {
      await prisma.player.create({
        data,
      });
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      throw new Error('Istnieje już zawodnik z tym samym numerem koszulki w podanym klubie.');
    }
    throw error;
  }

  revalidatePath('/', 'layout'); // Agresywne odświeżenie cache'u dla pewności
  redirect('/admin/players');
}

export async function deletePlayerAction(formData: FormData) {
  const idStr = formData.get('id') as string;
  if (!idStr) return;

  await prisma.player.delete({
    where: { id: Number(idStr) },
  });

  revalidatePath('/', 'layout');
}
