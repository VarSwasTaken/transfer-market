import Link from 'next/link';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { ClubLogo, PlayerAvatar } from '@/components/media/entity-media';

import { prisma } from '@/lib/prisma';
import { listTransferRumors, type TransferRumorDto } from '@/lib/services/transfer-rumors';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getPlayerPositionAbbreviation } from '@/lib/utils';

type PageParams = {
  searchParams: Promise<Record<string, string | undefined>>;
};

type PlayerTone = 'emerald' | 'orange' | 'blue' | 'sky' | 'violet';

const playerToneByPosition: Record<string, PlayerTone> = {
  GOALKEEPER: 'violet',
  DEFENDER: 'orange',
  MIDFIELDER: 'sky',
  FORWARD: 'emerald',
};

function parsePositiveInt(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function formatMoney(value: number | null, currency: string) {
  if (value === null) {
    return '—';
  }

  const symbol = currency === 'EUR' ? '€' : `${currency} `;

  if (value >= 1_000_000) {
    return `${symbol}${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `${symbol}${Math.round(value / 1_000)}K`;
  }

  return `${symbol}${value}`;
}

function formatFee(rumor: TransferRumorDto) {
  if (rumor.rumorType === 'Loan') {
    return rumor.rumoredLoanFee !== null ? formatMoney(rumor.rumoredLoanFee, rumor.currency) : '—';
  }

  if (rumor.rumorType === 'Swap') {
    return rumor.rumoredFee !== null ? formatMoney(rumor.rumoredFee, rumor.currency) : '—';
  }

  return rumor.rumoredFee !== null ? formatMoney(rumor.rumoredFee, rumor.currency) : '—';
}

function rumorTypeLabel(rumorType: TransferRumorDto['rumorType']) {
  switch (rumorType) {
    case 'Loan':
      return '📤 Wypożyczenie';
    case 'Swap':
      return '🔄 Wymiana';
    default:
      return '✓ Transfer';
  }
}

function statusBadgeClass(status: TransferRumorDto['status']) {
  switch (status) {
    case 'Confirmed':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    case 'Denied':
      return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    case 'Expired':
      return 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30';
    default:
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
  }
}

function credibilityBadgeClass(credibility: TransferRumorDto['credibility']) {
  switch (credibility) {
    case 'High':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    case 'Low':
      return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    default:
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
  }
}

function credibilityLabel(credibility: TransferRumorDto['credibility']) {
  switch (credibility) {
    case 'High':
      return '★★★ Wysoka';
    case 'Low':
      return '★☆☆ Niska';
    default:
      return '★★☆ Średnia';
  }
}

export default async function TransferRumoursPage({ searchParams }: PageParams) {
  const params = await searchParams;
  const page = parsePositiveInt(params.page, 1);
  const limit = 10;

  const { items, total } = await listTransferRumors({ page, limit });

  const playerIds = [...new Set(items.map((item) => item.playerId))];
  const clubIds = [...new Set(items.flatMap((item) => [item.fromClubId, item.toClubId]).filter((id): id is number => typeof id === 'number'))];

  const [players, clubs] = await Promise.all([
    prisma.player.findMany({
      where: { id: { in: playerIds } },
      select: { id: true, firstName: true, lastName: true, imageUrl: true, position: true },
    }),
    prisma.club.findMany({
      where: { id: { in: clubIds } },
      select: { id: true, name: true, logoUrl: true },
    }),
  ]);

  const playerById = new Map(players.map((player) => [player.id, player] as const));
  const clubById = new Map(clubs.map((club) => [club.id, club] as const));

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const buildPaginationUrl = (pageNum: number) => `/transfers/rumours?page=${pageNum}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-orange-600 to-orange-700">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Plotki transferowe</h1>
            <p className="text-sm text-muted-foreground mt-1">Najgorętsze plotki z rynku transferowego</p>
          </div>
        </div>
      </div>

      {/* Tabela plotek */}
      <Card className="border-border/40 bg-card/50 overflow-hidden">
        <CardContent className="p-0">
          {items.length === 0 ? (
            <div className="px-6 py-12 text-center text-muted-foreground">
              <TrendingUp className="h-8 w-8 mx-auto mb-3 opacity-30" />
              <p>Brak plotek do wyświetlenia</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/30 bg-muted/30">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Zawodnik</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Typ</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kierunek</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Wartość</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Wiarygodność</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Źródło</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {items.map((rumor) => {
                    const player = playerById.get(rumor.playerId);
                    const fromClub = rumor.fromClubId ? clubById.get(rumor.fromClubId) : null;
                    const toClub = rumor.toClubId ? clubById.get(rumor.toClubId) : null;
                    const storedPlayerName = `${rumor.playerFirstName ?? ''} ${rumor.playerLastName ?? ''}`.trim();
                    const playerName = player ? `${player.firstName} ${player.lastName}`.trim() : storedPlayerName || `Zawodnik #${rumor.playerId}`;
                    const avatarTone = player?.position ? playerToneByPosition[player.position] || 'emerald' : 'emerald';

                    return (
                      <tr key={rumor.id} className="hover:bg-emerald-500/5 transition-colors">
                        <td className="px-4 py-3">
                          <Link href={`/players/${rumor.playerId}`} className="flex items-center gap-3 group">
                            <PlayerAvatar name={playerName} firstName={player?.firstName ?? rumor.playerFirstName ?? undefined} lastName={player?.lastName ?? rumor.playerLastName ?? undefined} imageUrl={player?.imageUrl} tone={avatarTone} className="flex h-12 w-9 shrink-0 items-center justify-center overflow-hidden rounded text-xs font-bold" imageClassName="h-full w-full object-cover object-center" />
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-foreground group-hover:text-emerald-400 transition-colors truncate">{playerName}</div>
                              <div className="mt-1">
                                <span className="inline-block px-1.5 py-0.5 rounded bg-muted text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{player?.position ? getPlayerPositionAbbreviation(player.position) : 'N/A'}</span>
                              </div>
                            </div>
                          </Link>
                        </td>

                        <td className="px-4 py-3 text-sm text-muted-foreground">{rumorTypeLabel(rumor.rumorType)}</td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-sm">
                            {fromClub ? (
                              <Link href={`/clubs/${rumor.fromClubId}`} className="flex items-center gap-1.5 text-foreground hover:text-emerald-400 transition-colors truncate max-w-[140px] group">
                                <ClubLogo name={fromClub.name} logoUrl={fromClub.logoUrl} className="h-6 w-6" />
                                <span className="truncate group-hover:underline">{fromClub.name}</span>
                              </Link>
                            ) : (
                              <span className="text-muted-foreground">Brak</span>
                            )}

                            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />

                            {toClub ? (
                              <Link href={`/clubs/${rumor.toClubId}`} className="flex items-center gap-1.5 text-foreground hover:text-emerald-400 transition-colors truncate max-w-[140px] group">
                                <ClubLogo name={toClub.name} logoUrl={toClub.logoUrl} className="h-6 w-6" />
                                <span className="truncate group-hover:underline">{toClub.name}</span>
                              </Link>
                            ) : (
                              <span className="text-muted-foreground">Nieznany</span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3 text-center font-semibold text-emerald-400 text-sm">{formatFee(rumor)}</td>

                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full border text-[11px] font-semibold ${credibilityBadgeClass(rumor.credibility)}`}>{credibilityLabel(rumor.credibility)}</span>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full border text-[11px] font-semibold ${statusBadgeClass(rumor.status)}`}>{rumor.status}</span>
                        </td>

                        <td className="px-4 py-3 text-center text-sm text-muted-foreground">{rumor.source}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <Link href={buildPaginationUrl(Math.max(1, page - 1))} className={page === 1 ? 'pointer-events-none opacity-50' : ''}>
            <Button variant="outline" size="sm" disabled={page === 1}>
              ← Poprzednia
            </Button>
          </Link>

          <div className="text-sm text-muted-foreground">
            Strona <span className="font-semibold text-foreground">{page}</span> z <span className="font-semibold text-foreground">{totalPages}</span>
          </div>

          <Link href={buildPaginationUrl(Math.min(totalPages, page + 1))} className={page === totalPages ? 'pointer-events-none opacity-50' : ''}>
            <Button variant="outline" size="sm" disabled={page === totalPages}>
              Następna →
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
