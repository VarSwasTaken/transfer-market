'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { savePlayerAction } from './actions';

type FormState = {
  error?: string;
} | null;

async function actionWrapper(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    await savePlayerAction(formData);
    return null;
  } catch (error: Error | unknown) {
    return { error: error instanceof Error ? error.message : 'Wystąpił błąd podczas zapisywania zawodnika.' };
  }
}

type PlayerInitialData = {
  id?: number;
  firstName?: string;
  lastName?: string;
  birthDate?: Date;
  shirtNumber?: number;
  height?: number | null;
  weight?: number | null;
  position?: string;
  preferredFoot?: string;
  marketValue?: { toString: () => string };
  imageUrl?: string | null;
  nationalityId?: number;
  clubId?: number | null;
  agentId?: number | null;
} | null;

export function PlayerForm({ initialData, nationalities, clubs, agents }: { initialData?: PlayerInitialData; nationalities: { id: number; name_PL: string }[]; clubs: { id: number; name: string }[]; agents: { id: number; name: string }[] }) {
  const [state, formAction, isPending] = useActionState(actionWrapper, null);

  const defaultDate = initialData?.birthDate ? new Date(initialData.birthDate).toISOString().split('T')[0] : '';

  return (
    <form action={formAction} className="bg-card p-6 rounded-lg border border-border shadow-sm flex flex-col gap-4">
      {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

      {state?.error && <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">{state.error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground">Imię *</label>
          <input name="firstName" type="text" defaultValue={initialData?.firstName} required className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <div>
          {/* Usunięto 'required' oraz gwiazdkę przy Nazwisku */}
          <label className="block text-sm font-medium mb-1 text-muted-foreground">Nazwisko</label>
          <input name="lastName" type="text" defaultValue={initialData?.lastName} className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground">Data urodzenia *</label>
          <input name="birthDate" type="date" defaultValue={defaultDate} required className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground">Narodowość *</label>
          <select name="nationalityId" defaultValue={initialData?.nationalityId || ''} required className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="" disabled>
              Wybierz kraj...
            </option>
            {nationalities.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name_PL}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground">Pozycja *</label>
          <select name="position" defaultValue={initialData?.position || ''} required className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="" disabled>
              Wybierz pozycję...
            </option>
            <option value="GOALKEEPER">Bramkarz</option>
            <option value="DEFENDER">Obrońca</option>
            <option value="MIDFIELDER">Pomocnik</option>
            <option value="FORWARD">Napastnik</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground">Lepsza Noga</label>
          <select name="preferredFoot" defaultValue={initialData?.preferredFoot || 'RIGHT'} className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="RIGHT">Prawa</option>
            <option value="LEFT">Lewa</option>
            <option value="BOTH">Obie</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground">Wzrost (cm)</label>
          <input name="height" type="number" defaultValue={initialData?.height?.toString()} className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground">Waga (kg)</label>
          <input name="weight" type="number" defaultValue={initialData?.weight?.toString()} className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground">Numer koszulki *</label>
          <input name="shirtNumber" type="number" defaultValue={initialData?.shirtNumber?.toString()} required className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground">Wartość rynkowa (np. w milionach) *</label>
          <input name="marketValue" type="number" step="0.01" defaultValue={initialData?.marketValue?.toString()} required className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground">URL Zdjęcie / Twarz</label>
          <input name="imageUrl" type="url" defaultValue={initialData?.imageUrl || ''} className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground">Klub (opcjonalnie)</label>
          <select name="clubId" defaultValue={initialData?.clubId || ''} className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">-- Bez Klubu (Wolny Agent) --</option>
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-muted-foreground">Agent (opcjonalnie)</label>
          <select name="agentId" defaultValue={initialData?.agentId || ''} className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="">-- Brak Agenta --</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <Link href="/admin/players" className="px-4 py-2 bg-muted text-muted-foreground hover:bg-muted/80 rounded-md transition-colors text-sm font-medium">
          Anuluj
        </Link>
        <button type="submit" disabled={isPending} className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-500 rounded-md transition-colors text-sm font-medium disabled:opacity-50">
          {isPending ? 'Zapisywanie...' : 'Zapisz'}
        </button>
      </div>
    </form>
  );
}
