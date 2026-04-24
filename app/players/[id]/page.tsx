import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Activity, TrendingUp, TrendingDown, Minus, Shield } from 'lucide-react';
import { notFound } from 'next/navigation';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ValueChart } from '@/components/player/value-chart';
import { getPlayerProfile } from '@/lib/services/player-profile';

type Trend = 'up' | 'down' | 'neutral';

type PlayerProfileData = {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: string;
  position: 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD';
  preferredFoot: 'LEFT' | 'RIGHT' | 'BOTH';
  height: number | null;
  weight: number | null;
  marketValue: string | null;
  imageUrl: string | null;
  nationality: { id: number; name: string; flagUrl: string | null } | null;
  club: { id: number; name: string; logoUrl?: string | null } | null;
  agent: { id: number; name: string } | null;
  contracts: Array<{ id: number; endDate: string }>;
  transfers: Array<{
    id: number;
    transferType: 'PERMANENT' | 'LOAN' | 'FREE';
    date: string;
    fee: string | null;
    fromClub: { id: number; name: string; logoUrl?: string | null } | null;
    toClub: { id: number; name: string; logoUrl?: string | null };
  }>;
  injuries: Array<{
    id: string;
    type: string;
    severity: 'Lekka' | 'Średnia' | 'Poważna' | 'Krytyczna';
    startDate: string;
    expectedReturnDate: string | null;
    actualReturnDate: string | null;
  }>;
};

const severityConfig = {
  Lekka: { label: 'Lekka', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  Średnia: { label: 'Srednia', className: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  Poważna: { label: 'Poważna', className: 'bg-rose-500/15 text-rose-400 border-rose-500/20' },
  Krytyczna: { label: 'Krytyczna', className: 'bg-rose-500/15 text-rose-400 border-rose-500/20' },
} as const;

const typeConfig = {
  PERMANENT: { label: 'Transfer', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  LOAN: { label: 'Wypozyczenie', className: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  FREE: { label: 'Wolny transfer', className: 'bg-sky-500/15 text-sky-400 border-sky-500/20' },
} as const;

const positionLabel: Record<PlayerProfileData['position'], { full: string; short: string }> = {
  GOALKEEPER: { full: 'Bramkarz', short: 'BR' },
  DEFENDER: { full: 'Obronca', short: 'OBR' },
  MIDFIELDER: { full: 'Pomocnik', short: 'POM' },
  FORWARD: { full: 'Napastnik', short: 'N' },
};

const preferredFootLabel: Record<PlayerProfileData['preferredFoot'], string> = {
  LEFT: 'Lewa',
  RIGHT: 'Prawa',
  BOTH: 'Obie',
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatMonthYear(value: string) {
  return new Date(value).toLocaleDateString('pl-PL', {
    month: 'short',
    year: 'numeric',
  });
}

function calculateAge(birthDateIso: string) {
  const birthDate = new Date(birthDateIso);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
}

function formatMarketValue(raw: string | null) {
  if (!raw) {
    return 'Brak danych';
  }

  const numericValue = Number(raw);
  if (Number.isNaN(numericValue)) {
    return raw;
  }

  if (numericValue >= 1_000_000) {
    return `${Math.round(numericValue / 1_000_000)} mln €`;
  }

  return `${numericValue.toLocaleString('pl-PL')} €`;
}

function getTrend(type: 'PERMANENT' | 'LOAN' | 'FREE', fee: string | null): Trend {
  if (type === 'PERMANENT' && Number(fee ?? '0') > 0) {
    return 'up';
  }

  return 'neutral';
}

function TrendIcon({ trend }: { trend: Trend }) {
  if (trend === 'up') return <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />;
  if (trend === 'down') return <TrendingDown className="h-3.5 w-3.5 text-rose-400" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
}

export default async function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const playerId = Number(id);

  if (!Number.isInteger(playerId) || playerId <= 0) {
    notFound();
  }

  const profile = await getPlayerProfile(playerId);
  const player = profile.data as PlayerProfileData | null;

  if (!player) {
    notFound();
  }

  const name = `${player.firstName} ${player.lastName}`.trim();
  const age = calculateAge(player.birthDate);
  const position = positionLabel[player.position];
  const preferredFoot = preferredFootLabel[player.preferredFoot];
  const marketValue = formatMarketValue(player.marketValue);
  const contractEnd = player.contracts[0]?.endDate ? formatMonthYear(player.contracts[0].endDate) : 'Brak danych';
  const avatarSrc = player.imageUrl?.trim() || null;
  const avatarIsExternal = avatarSrc ? /^https?:\/\//i.test(avatarSrc) : false;
  const initials = `${player.firstName?.[0] ?? ''}${player.lastName?.[0] ?? ''}`.toUpperCase() || '??';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 rounded-xl border border-border/40 bg-card/50 p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="relative flex aspect-[300/390] w-[120px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-3xl font-extrabold text-white shadow-lg shadow-emerald-900/30">
              {avatarSrc ? (
                avatarIsExternal ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarSrc} alt={name} className="h-full w-full object-cover object-center" />
                ) : (
                  <Image src={avatarSrc} alt={name} fill className="object-cover object-center" />
                )
              ) : (
                initials
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">{name}</h1>
                <span className="rounded border border-emerald-500/20 bg-emerald-500/15 px-2 py-1 text-xs font-bold text-emerald-400">{position.short}</span>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                <div className="rounded-lg border border-border/30 bg-background/60 px-3 py-2">
                  <p className="mb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Wartość rynkowa</p>
                  <p className="text-base font-bold text-emerald-400">{marketValue}</p>
                </div>
                <div className="rounded-lg border border-border/30 bg-background/60 px-3 py-2">
                  <p className="mb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Pozycja</p>
                  <p className="text-base font-bold text-foreground">{position.full}</p>
                </div>
                <div className="rounded-lg border border-border/30 bg-background/60 px-3 py-2">
                  <p className="mb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Lepsza noga</p>
                  <p className="text-base font-bold text-foreground">{preferredFoot}</p>
                </div>
                <div className="rounded-lg border border-border/30 bg-background/60 px-3 py-2">
                  <p className="mb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Wiek</p>
                  <p className="text-base font-bold text-foreground">{age} lat</p>
                </div>
                <div className="rounded-lg border border-border/30 bg-background/60 px-3 py-2">
                  <p className="mb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Wzrost</p>
                  <p className="text-base font-bold text-foreground">{player.height ? `${player.height} cm` : 'Brak danych'}</p>
                </div>
                <div className="rounded-lg border border-border/30 bg-background/60 px-3 py-2">
                  <p className="mb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Waga</p>
                  <p className="text-base font-bold text-foreground">{player.weight ? `${player.weight} kg` : 'Brak danych'}</p>
                </div>
                <div className="rounded-lg border border-border/30 bg-background/60 px-3 py-2">
                  <p className="mb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Aktualny klub</p>
                  {player.club ? (
                    <div className="flex items-center gap-2">
                      {player.club.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={player.club.logoUrl} alt={`${player.club.name} logo`} className="h-5 w-5 shrink-0 rounded-full object-cover" />
                      ) : (
                        <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                          <Shield className="h-3.5 w-3.5" />
                        </span>
                      )}
                      <Link href={`/klub/${player.club.id}`} className="text-base font-bold text-foreground transition-colors hover:text-emerald-400">
                        {player.club.name}
                      </Link>
                    </div>
                  ) : (
                    <p className="text-base font-bold text-foreground">Bez klubu</p>
                  )}
                </div>
                <div className="rounded-lg border border-border/30 bg-background/60 px-3 py-2">
                  <p className="mb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Narodowość</p>
                  {player.nationality ? (
                    <div className="flex items-center gap-2">
                      {player.nationality.flagUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={player.nationality.flagUrl} alt={`${player.nationality.name} flaga`} className="h-4 w-6 shrink-0 rounded-sm object-cover" />
                      ) : null}
                      <p className="text-base font-bold text-foreground">{player.nationality.name}</p>
                    </div>
                  ) : (
                    <p className="text-base font-bold text-foreground">Brak danych</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                <span className="text-muted-foreground">
                  Agent:{' '}
                  {player.agent ? (
                    <Link href={`/agent/${player.agent.id}`} className="font-medium text-foreground transition-colors hover:text-emerald-400">
                      {player.agent.name}
                    </Link>
                  ) : (
                    <span className="font-medium text-foreground">Brak danych</span>
                  )}{' '}
                </span>
                <span className="text-muted-foreground">
                  Urodzony:{' '}
                  <span className="font-medium text-foreground">
                    {formatDate(player.birthDate)} ({age} lat)
                  </span>
                </span>
                <span className="text-muted-foreground">
                  Kontrakt do: <span className="font-medium text-foreground">{contractEnd}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <Card className="border-border/40 bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <ArrowRight className="h-4 w-4 text-emerald-400" />
                  Historia transferów
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/30">
                  {player.transfers.length === 0 && <div className="px-6 py-4 text-sm text-muted-foreground">Brak historii transferow.</div>}
                  {player.transfers.map((transfer) => {
                    const trend = getTrend(transfer.transferType, transfer.fee);
                    const feeLabel = transfer.transferType === 'FREE' ? '0M €' : transfer.transferType === 'LOAN' ? 'Wypozyczenie' : formatMarketValue(transfer.fee);

                    return (
                      <div key={transfer.id} className="flex items-center gap-4 px-6 py-3.5">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 text-sm">
                            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                              {transfer.fromClub?.logoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={transfer.fromClub.logoUrl} alt={`${transfer.fromClub.name} logo`} className="h-4 w-4 shrink-0 rounded-full object-cover" />
                              ) : (
                                <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                  <Shield className="h-2.5 w-2.5" />
                                </span>
                              )}
                              {transfer.fromClub ? (
                                <Link href={`/klub/${transfer.fromClub.id}`} className="transition-colors hover:text-emerald-400">
                                  {transfer.fromClub.name}
                                </Link>
                              ) : (
                                'Brak klubu'
                              )}
                            </span>
                            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                              {transfer.toClub.logoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={transfer.toClub.logoUrl} alt={`${transfer.toClub.name} logo`} className="h-4 w-4 shrink-0 rounded-full object-cover" />
                              ) : (
                                <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                  <Shield className="h-2.5 w-2.5" />
                                </span>
                              )}
                              <Link href={`/klub/${transfer.toClub.id}`} className="transition-colors hover:text-emerald-400">
                                {transfer.toClub.name}
                              </Link>
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge variant="outline" className={`px-1.5 py-0 text-[10px] ${typeConfig[transfer.transferType].className}`}>
                              {typeConfig[transfer.transferType].label}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{formatMonthYear(transfer.date)}</span>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <TrendIcon trend={trend} />
                          <span className="text-sm font-semibold text-foreground">{feeLabel}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Activity className="h-4 w-4 text-rose-400" />
                  Historia kontuzji
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/30">
                  {player.injuries.length === 0 && <div className="px-6 py-4 text-sm text-muted-foreground">Brak historii kontuzji.</div>}
                  {player.injuries.map((injury) => (
                    <div key={injury.id} className="flex items-center gap-4 px-6 py-3.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{injury.type}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatDate(injury.startDate)} &ndash; {injury.actualReturnDate ? formatDate(injury.actualReturnDate) : injury.expectedReturnDate ? formatDate(injury.expectedReturnDate) : 'Brak daty powrotu'}
                        </p>
                      </div>
                      <Badge variant="outline" className={`shrink-0 px-1.5 py-0 text-[10px] ${severityConfig[injury.severity].className}`}>
                        {severityConfig[injury.severity].label}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-6">
            {/* Historyczny wykres wartosci pozostaje hardcoded, bo nie przechowujemy jeszcze historii. */}
            <ValueChart />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
