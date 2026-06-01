import Link from 'next/link';
import { ArrowRight, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/prisma';
import { listTransferRumors } from '@/lib/services/transfer-rumors';
import { ClubLogo, PlayerAvatar } from '@/components/media/entity-media';
import { getPlayerPositionAbbreviation } from '@/lib/utils';

function ReliabilityBar({ value: credibility }: { value: string }) {
  const numValue = credibility === 'High' ? 85 : credibility === 'Low' ? 40 : 65;
  const color = numValue >= 80 ? 'bg-emerald-500' : numValue >= 60 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${numValue}%` }} />
      </div>
      <span className="text-[10px] text-muted-foreground">{numValue}%</span>
    </div>
  );
}

export async function HotRumours() {
  const { items } = await listTransferRumors({ page: 1, limit: 5 });

  if (items.length === 0) {
    return null;
  }

  const playerIds = items.map((r) => r.playerId);
  const clubIds = items.flatMap((r) => [r.fromClubId, r.toClubId]).filter((id): id is number => typeof id === 'number');

  const [players, clubs] = await Promise.all([
    prisma.player.findMany({
      where: { id: { in: playerIds } },
      select: { id: true, firstName: true, lastName: true, position: true, imageUrl: true, nationality: { select: { flagUrl: true } } },
    }),
    prisma.club.findMany({
      where: { id: { in: clubIds } },
      select: { id: true, name: true, logoUrl: true },
    }),
  ]);

  const playerMap = new Map(players.map((p) => [p.id, p]));
  const clubMap = new Map(clubs.map((c) => [c.id, c]));

  return (
    <Card className="bg-card/50 border-border/40">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-400" />
          Gorące plotki
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 -mr-2" asChild>
          <Link href="/transfers/rumours">
            Wszystkie <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/30">
          {items.map((r) => {
            const player = playerMap.get(r.playerId);
            const fromClub = r.fromClubId ? clubMap.get(r.fromClubId) : null;
            const toClub = r.toClubId ? clubMap.get(r.toClubId) : null;
            const storedPlayerName = `${r.playerFirstName ?? ''} ${r.playerLastName ?? ''}`.trim();
            const playerName = player ? `${player.firstName} ${player.lastName}`.trim() : storedPlayerName || `Zawodnik #${r.playerId}`;

            return (
              <Link key={r.id} href={`/players/${r.playerId}`} className="flex items-center gap-3 px-6 py-3.5 hover:bg-muted/30 transition-colors group">
                <PlayerAvatar firstName={player?.firstName ?? r.playerFirstName ?? undefined} lastName={player?.lastName ?? r.playerLastName ?? undefined} name={playerName} imageUrl={player?.imageUrl} tone="orange" className="flex h-12 w-9 shrink-0 items-center justify-center overflow-hidden rounded" imageClassName="h-full w-full object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground group-hover:text-emerald-400 transition-colors truncate">{playerName}</span>
                    <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{player ? getPlayerPositionAbbreviation(player.position) : 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                    {fromClub && (
                      <>
                        <ClubLogo name={fromClub.name} logoUrl={fromClub.logoUrl} className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-none bg-muted" imageClassName="h-full w-full object-contain object-center" iconClassName="h-3 w-3 text-muted-foreground" />
                        <span>{fromClub.name}</span>
                      </>
                    )}
                    {fromClub && toClub && <ArrowRight className="h-3 w-3 shrink-0" />}
                    {toClub && (
                      <>
                        <ClubLogo name={toClub.name} logoUrl={toClub.logoUrl} className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-none bg-muted" imageClassName="h-full w-full object-contain object-center" iconClassName="h-3 w-3 text-muted-foreground" />
                        <span>{toClub.name}</span>
                      </>
                    )}
                  </div>
                  <ReliabilityBar value={r.credibility} />
                </div>
                <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                  <span className="text-sm font-semibold text-foreground">{r.rumoredFee ? `€${(r.rumoredFee / 1_000_000).toFixed(0)}M` : '—'}</span>
                  <span className="text-xs text-muted-foreground">{new Date(r.publishedAt).toLocaleDateString('pl-PL')}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
