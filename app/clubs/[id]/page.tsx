import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Users, TrendingUp, Activity, Flame, Shield } from 'lucide-react';
import { notFound } from 'next/navigation';

import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SquadValueChart } from '@/components/club/squad-value-chart';
import { getClubProfile } from '@/lib/services/club-profile';

type ClubProfileData = {
  id: number;
  name: string;
  logoUrl: string | null;
  budget: string | null;
  league: {
    id: number;
    name: string;
    logoUrl: string | null;
    nationality: {
      id: number;
      name: string;
      flagUrl: string | null;
    } | null;
  } | null;
  stats: {
    playerCount: number;
    totalMarketValue: string;
    avgMarketValue: string;
  };
  players: Array<{
    id: number;
    firstName: string;
    lastName: string;
    shirtNumber: number;
    position: 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD';
    marketValue: string | null;
    nationality: {
      id: number;
      name: string;
      flagUrl: string | null;
    } | null;
  }>;
  transfersIn: Array<{
    id: number;
    player: {
      id: number;
      firstName: string;
      lastName: string;
      nationality: {
        id: number;
        name: string;
        flagUrl: string | null;
      } | null;
    };
    fromClub: {
      id: number;
      name: string;
      logoUrl: string | null;
    } | null;
    fee: string | null;
    transferType: 'PERMANENT' | 'LOAN' | 'FREE';
    date: string;
  }>;
  transfersOut: Array<{
    id: number;
    player: {
      id: number;
      firstName: string;
      lastName: string;
      nationality: {
        id: number;
        name: string;
        flagUrl: string | null;
      } | null;
    };
    toClub: {
      id: number;
      name: string;
      logoUrl: string | null;
    };
    fee: string | null;
    transferType: 'PERMANENT' | 'LOAN' | 'FREE';
    date: string;
  }>;
};

const positionLabel: Record<ClubProfileData['players'][number]['position'], string> = {
  GOALKEEPER: 'BR',
  DEFENDER: 'OBR',
  MIDFIELDER: 'POM',
  FORWARD: 'N',
};

const groupedPositionConfig: Array<{
  key: ClubProfileData['players'][number]['position'];
  title: string;
}> = [
  { key: 'GOALKEEPER', title: 'Bramkarze' },
  { key: 'DEFENDER', title: 'Obrońcy' },
  { key: 'MIDFIELDER', title: 'Pomocnicy' },
  { key: 'FORWARD', title: 'Napastnicy' },
];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatMoney(raw: string | null) {
  if (!raw) return 'Brak danych';

  const value = Number(raw);
  if (Number.isNaN(value)) return raw;

  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)} mld €`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} mln €`;

  return `${value.toLocaleString('pl-PL')} €`;
}

export default async function ClubProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clubId = Number(id);

  if (!Number.isInteger(clubId) || clubId <= 0) {
    notFound();
  }

  const profile = await getClubProfile(clubId);
  const club = profile.data as ClubProfileData | null;

  if (!club) {
    notFound();
  }

  const transfers = [
    ...club.transfersIn.map((transfer) => ({
      id: `in-${transfer.id}`,
      playerId: transfer.player.id,
      playerName: `${transfer.player.firstName} ${transfer.player.lastName}`.trim(),
      playerNationality: transfer.player.nationality,
      fromClub: transfer.fromClub,
      toClub: {
        id: club.id,
        name: club.name,
        logoUrl: club.logoUrl,
      },
      fee: transfer.fee,
      direction: 'in' as const,
      date: transfer.date,
    })),
    ...club.transfersOut.map((transfer) => ({
      id: `out-${transfer.id}`,
      playerId: transfer.player.id,
      playerName: `${transfer.player.firstName} ${transfer.player.lastName}`.trim(),
      playerNationality: transfer.player.nationality,
      fromClub: {
        id: club.id,
        name: club.name,
        logoUrl: club.logoUrl,
      },
      toClub: transfer.toClub,
      fee: transfer.fee,
      direction: 'out' as const,
      date: transfer.date,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const logoSrc = club.logoUrl?.trim() || null;
  const leagueLogoSrc = club.league?.logoUrl?.trim() || null;
  const nationalityFlagSrc = club.league?.nationality?.flagUrl?.trim() || null;

  const playersByPosition = groupedPositionConfig.map((section) => ({
    ...section,
    players: club.players.filter((player) => player.position === section.key).sort((a, b) => a.shirtNumber - b.shirtNumber || a.lastName.localeCompare(b.lastName)),
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 rounded-xl border border-border/40 bg-card/50 p-6">
          <div className="flex flex-col items-start gap-6 sm:flex-row">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-muted">
              {logoSrc ? (
                <Image src={logoSrc} alt={club.name} fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-emerald-600 to-emerald-800 text-2xl font-bold text-white">
                  {club.name
                    .split(' ')
                    .map((part) => part[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">{club.name}</h1>
                <Badge variant="outline" className="border-sky-500/20 bg-sky-500/10 text-xs text-sky-400">
                  {nationalityFlagSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={nationalityFlagSrc} alt="Flaga kraju" className="mr-1 h-3.5 w-5 rounded-sm object-cover" />
                  ) : (
                    <Shield className="mr-1 h-3.5 w-3.5" />
                  )}
                  {club.league?.nationality?.name ?? 'Brak kraju'}
                </Badge>
                <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-300">
                  {club.league ? (
                    <Link href={`/leagues/${club.league.id}`} className="inline-flex items-center hover:text-emerald-200">
                      {leagueLogoSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={leagueLogoSrc} alt="Logo ligi" className="mr-1 h-3.5 w-auto max-w-4 shrink-0 object-contain" />
                      ) : (
                        <Shield className="mr-1 h-3.5 w-3.5" />
                      )}
                      {club.league.name}
                    </Link>
                  ) : (
                    <>
                      <Shield className="mr-1 h-3.5 w-3.5" />
                      Brak ligi
                    </>
                  )}
                </Badge>
              </div>

              <p className="mb-4 text-sm text-muted-foreground">
                {club.league ? (
                  <Link href={`/leagues/${club.league.id}`} className="transition-colors hover:text-emerald-400">
                    {club.league.name}
                  </Link>
                ) : (
                  'Brak ligi'
                )}
              </p>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
                <div className="rounded-lg border border-border/30 bg-background/60 px-3 py-2">
                  <p className="mb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Liga</p>
                  <p className="flex items-center text-base font-bold text-foreground">
                    {leagueLogoSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={leagueLogoSrc} alt="Logo ligi" className="mr-2 h-4 w-auto max-w-5 shrink-0 object-contain" />
                    ) : (
                      <Shield className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    {club.league?.name ?? 'Brak danych'}
                  </p>
                </div>
                <div className="rounded-lg border border-border/30 bg-background/60 px-3 py-2">
                  <p className="mb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Państwo</p>
                  <p className="flex items-center text-base font-bold text-foreground">
                    {nationalityFlagSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={nationalityFlagSrc} alt="Flaga kraju" className="mr-2 h-3.5 w-5 rounded-sm object-cover" />
                    ) : (
                      <Shield className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    {club.league?.nationality?.name ?? 'Brak danych'}
                  </p>
                </div>
                <div className="rounded-lg border border-border/30 bg-background/60 px-3 py-2">
                  <p className="mb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Budżet transferowy</p>
                  <p className="text-base font-bold text-amber-400">{formatMoney(club.budget)}</p>
                </div>
                <div className="rounded-lg border border-border/30 bg-background/60 px-3 py-2">
                  <p className="mb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Wartość składu</p>
                  <p className="text-base font-bold text-emerald-400">{formatMoney(club.stats.totalMarketValue)}</p>
                </div>
                <div className="rounded-lg border border-border/30 bg-background/60 px-3 py-2">
                  <p className="mb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Rok założenia</p>
                  <p className="text-base font-bold text-foreground">Brak danych</p>
                </div>
                <div className="rounded-lg border border-border/30 bg-background/60 px-3 py-2">
                  <p className="mb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Stadion</p>
                  <p className="text-base font-bold text-foreground">Brak danych</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <Card className="border-border/40 bg-card/50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Users className="h-4 w-4 text-emerald-400" />
                  Skład zawodników
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-4 px-4 pb-4">
                  {club.players.length === 0 && <div className="px-2 py-2 text-sm text-muted-foreground">Brak zawodników w klubie.</div>}
                  {playersByPosition.map((section) => (
                    <div key={section.key} className="overflow-hidden rounded-lg border border-border/30 bg-background/50">
                      <div className="border-b border-border/30 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{section.title}</div>
                      {section.players.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-muted-foreground">Brak zawodników.</div>
                      ) : (
                        <div className="divide-y divide-border/30">
                          {section.players.map((player) => {
                            const playerName = `${player.firstName} ${player.lastName}`.trim();

                            return (
                              <Link key={player.id} href={`/players/${player.id}`} className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/30">
                                <span className="w-9 shrink-0 text-right text-xs font-bold text-emerald-400">#{player.shirtNumber}</span>
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-sky-600 to-sky-900 text-xs font-bold text-white">
                                  {playerName
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .slice(0, 2)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="truncate text-sm font-medium text-foreground transition-colors group-hover:text-emerald-400">{playerName}</span>
                                    <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">{positionLabel[player.position]}</span>
                                  </div>
                                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                                    {player.nationality?.flagUrl ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img src={player.nationality.flagUrl} alt={player.nationality.name} className="h-3.5 w-5 rounded-sm object-cover" />
                                    ) : (
                                      <Shield className="h-3.5 w-3.5" />
                                    )}
                                    <span>{player.nationality?.name ?? 'Brak narodowości'}</span>
                                  </div>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                  <span className="text-sm font-semibold text-emerald-400">{formatMoney(player.marketValue)}</span>
                                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-emerald-400" />
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <ArrowRight className="h-4 w-4 text-emerald-400" />
                  Transfery
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/30">
                  {transfers.length === 0 && <div className="px-6 py-4 text-sm text-muted-foreground">Brak historii transferow.</div>}
                  {transfers.map((transfer) => (
                    <div key={transfer.id} className="flex items-center gap-4 px-6 py-3.5">
                      <Badge variant="outline" className={`shrink-0 px-1.5 py-0 text-[10px] ${transfer.direction === 'in' ? 'border-emerald-500/20 bg-emerald-500/15 text-emerald-400' : 'border-rose-500/20 bg-rose-500/15 text-rose-400'}`}>
                        {transfer.direction === 'in' ? 'Przybycie' : 'Odejscie'}
                      </Badge>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                          {transfer.playerNationality?.flagUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={transfer.playerNationality.flagUrl} alt={transfer.playerNationality.name} className="h-3.5 w-5 shrink-0 rounded-sm object-cover" />
                          ) : (
                            <Shield className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          )}
                          <Link href={`/players/${transfer.playerId}`} className="truncate transition-colors hover:text-emerald-400">
                            {transfer.playerName}
                          </Link>
                        </p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1 rounded-full border border-border/40 bg-background/70 px-2 py-0.5">
                            {transfer.fromClub?.logoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={transfer.fromClub.logoUrl} alt={transfer.fromClub.name} className="h-3.5 w-3.5 rounded-full object-cover" />
                            ) : (
                              <Shield className="h-3 w-3 text-muted-foreground" />
                            )}
                            {transfer.fromClub ? (
                              <Link href={`/clubs/${transfer.fromClub.id}`} className="max-w-40 truncate transition-colors hover:text-foreground">
                                {transfer.fromClub.name}
                              </Link>
                            ) : (
                              <span className="max-w-40 truncate">Bez klubu</span>
                            )}
                          </span>
                          <ArrowRight className="h-3 w-3 shrink-0" />
                          <span className="inline-flex items-center gap-1 rounded-full border border-border/40 bg-background/70 px-2 py-0.5">
                            {transfer.toClub.logoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={transfer.toClub.logoUrl} alt={transfer.toClub.name} className="h-3.5 w-3.5 rounded-full object-cover" />
                            ) : (
                              <Shield className="h-3 w-3 text-muted-foreground" />
                            )}
                            <Link href={`/clubs/${transfer.toClub.id}`} className="max-w-40 truncate transition-colors hover:text-foreground">
                              {transfer.toClub.name}
                            </Link>
                          </span>
                          <span>&middot; {formatDate(transfer.date)}</span>
                        </div>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-foreground">{formatMoney(transfer.fee)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Flame className="h-4 w-4 text-orange-400" />
                  Plotki transferowe
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-4 text-sm text-muted-foreground">Brak danych o plotkach transferowych dla klubu w obecnym modelu bazy.</CardContent>
            </Card>

            <Card className="border-border/40 bg-card/50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Activity className="h-4 w-4 text-rose-400" />
                  Kontuzjowani zawodnicy
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-4 text-sm text-muted-foreground">Brak danych o kontuzjach klubowych w obecnym modelu bazy.</CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-6">
            <SquadValueChart />

            <Card className="border-border/40 bg-card/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  Statystyki składu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border border-border/30 bg-background/60 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Liczba zawodników</p>
                  <p className="text-base font-bold text-foreground">{club.stats.playerCount}</p>
                </div>
                <div className="rounded-lg border border-border/30 bg-background/60 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Średnia wartość zawodnika</p>
                  <p className="text-base font-bold text-foreground">{formatMoney(club.stats.avgMarketValue)}</p>
                </div>
                <div className="rounded-lg border border-border/30 bg-background/60 px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Wartość składu</p>
                  <p className="text-base font-bold text-emerald-400">{formatMoney(club.stats.totalMarketValue)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="mt-12 border-t border-border/40">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">&copy; 2026 TransferHub &mdash; Projekt baz danych</p>
        </div>
      </footer>
    </div>
  );
}
