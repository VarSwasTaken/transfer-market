import Link from 'next/link';
import { ArrowRight, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { listInjuries } from '@/lib/services/injuries';
import { prisma } from '@/lib/prisma';
import { PlayerAvatar } from '@/components/media/entity-media';
import { getPlayerPositionAbbreviation } from '@/lib/utils';

export async function InjuredPlayers() {
  const { items } = await listInjuries({ page: 1, limit: 5 });

  if (items.length === 0) {
    return null;
  }

  const playerIds = items.map((i) => i.playerId);
  const players = await prisma.player.findMany({
    where: { id: { in: playerIds } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      position: true,
      imageUrl: true,
      club: { select: { name: true } },
    },
  });

  const playerMap = new Map(players.map((p) => [p.id, p]));

  const severityConfig = {
    Lekka: { label: 'Lekka', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
    Średnia: { label: 'Średnia', className: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
    Poważna: { label: 'Ciężka', className: 'bg-rose-500/15 text-rose-400 border-rose-500/20' },
    Krytyczna: { label: 'Krytyczna', className: 'bg-red-500/15 text-red-400 border-red-500/20' },
  };

  return (
    <Card className="bg-card/50 border-border/40">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-rose-400" />
          Kontuzjowani zawodnicy
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 -mr-2" asChild>
          <Link href="/players">
            Wszyscy <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/30">
          {items.map((p) => {
            const player = playerMap.get(p.playerId);
            const config = severityConfig[p.severity as keyof typeof severityConfig] || severityConfig['Średnia'];
            const returnDate = p.expectedReturnDate ? new Date(p.expectedReturnDate).toLocaleDateString('pl-PL') : 'N/A';
            const storedPlayerName = `${p.playerFirstName ?? ''} ${p.playerLastName ?? ''}`.trim();
            const playerName = player ? `${player.firstName} ${player.lastName}`.trim() : storedPlayerName || `Zawodnik #${p.playerId}`;

            return (
              <Link key={p.id} href={`/players/${p.playerId}`} className="flex items-center gap-3 px-6 py-3 hover:bg-muted/30 transition-colors group">
                <PlayerAvatar firstName={player?.firstName ?? p.playerFirstName ?? undefined} lastName={player?.lastName ?? p.playerLastName ?? undefined} name={playerName} imageUrl={player?.imageUrl} className="flex h-12 w-9 shrink-0 items-center justify-center overflow-hidden rounded" imageClassName="h-full w-full object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-foreground group-hover:text-emerald-400 transition-colors truncate">{playerName}</span>
                    <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{player ? getPlayerPositionAbbreviation(player.position) : 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">
                      {player?.club?.name || 'N/A'} • {p.type}
                    </span>
                  </div>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${config.className}`}>
                    {config.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Powrót: {returnDate}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
