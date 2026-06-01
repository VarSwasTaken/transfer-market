'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { saveTransferAction } from './actions';

type FormState = {
  error?: string;
} | null;

async function actionWrapper(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    await saveTransferAction(formData);
    return null;
  } catch (error: Error | unknown) {
    return { error: error instanceof Error ? error.message : 'Wystąpił błąd podczas zapisywania transferu.' };
  }
}

type TransferInitialData = {
  id?: number;
  playerId?: number;
  fromClubId?: number | null;
  toClubId?: number;
  fee?: { toString: () => string };
  transferType?: string;
  loanEndDate?: Date | null;
  date?: Date;
} | null;

export function TransferForm({ initialData, players, clubs }: { initialData?: TransferInitialData; players: { id: number; firstName: string; lastName: string; clubId?: number | null }[]; clubs: { id: number; name: string }[] }) {
  const [state, formAction, isPending] = useActionState(actionWrapper, null);

  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(initialData?.playerId?.toString() || '');
  const [fromClubId, setFromClubId] = useState<string>(initialData?.fromClubId?.toString() || '');

  const formatInitialDate = (date?: Date | null) => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  };

  const handlePlayerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const playerId = e.target.value;
    setSelectedPlayerId(playerId);

    const player = players.find((p) => p.id.toString() === playerId);
    setFromClubId(player?.clubId?.toString() || '');
  };

  // Znajdź nazwę obecnego klubu do wyświetlenia w zablokowanym polu
  const fromClubName = clubs.find((c) => c.id.toString() === fromClubId)?.name || 'Brak klubu (Wolny agent)';

  return (
    <form action={formAction} className="bg-card p-6 rounded-lg border border-border shadow-sm flex flex-col gap-4">
      {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

      {state?.error && <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">{state.error}</div>}

      <div>
        <label className="block text-sm font-medium mb-1 text-muted-foreground">Zawodnik *</label>
        <select name="playerId" value={selectedPlayerId} onChange={handlePlayerChange} required className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="" disabled>
            Wybierz zawodnika...
          </option>
          {players.map((p) => (
            <option key={p.id} value={p.id}>
              {p.firstName} {p.lastName}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground">Obecny Klub</label>

          <input type="hidden" name="fromClubId" value={fromClubId} />

          {/* Zmieniono na czysty readOnly input */}
          <input type="text" readOnly value={fromClubId ? fromClubName : 'Brak klubu (Wolny agent)'} className="w-full bg-muted/50 border border-border rounded-md px-3 py-2 text-muted-foreground focus:outline-none cursor-not-allowed" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground">Klub Docelowy *</label>
          <select name="toClubId" defaultValue={initialData?.toClubId || ''} required className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="" disabled>
              Wybierz klub docelowy...
            </option>
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground">Typ Transferu *</label>
          <select name="transferType" defaultValue={initialData?.transferType || 'PERMANENT'} required className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="PERMANENT">Definitywny</option>
            <option value="LOAN">Wypożyczenie</option>
            <option value="FREE">Wolny Transfer</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground">Kwota Transferu (w mln/wybranej walucie, wpisz 0 dla darmowych) *</label>
          <input name="fee" type="number" step="0.01" defaultValue={initialData?.fee?.toString() || '0'} required className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground">Data Zawarcia Umowy / Data Transakcji *</label>
          <input name="date" type="date" defaultValue={formatInitialDate(initialData?.date || new Date())} required className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground">Koniec Wypożyczenia (Opcjonalne)</label>
          <input name="loanEndDate" type="date" defaultValue={formatInitialDate(initialData?.loanEndDate)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <Link href="/admin/transfers" className="px-4 py-2 bg-muted text-muted-foreground hover:bg-muted/80 rounded-md transition-colors text-sm font-medium">
          Anuluj
        </Link>
        <button type="submit" disabled={isPending} className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-500 rounded-md transition-colors text-sm font-medium disabled:opacity-50">
          {isPending ? 'Zapisywanie...' : 'Zapisz'}
        </button>
      </div>
    </form>
  );
}
