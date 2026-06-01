'use client';
import Link from 'next/link';
import { ArrowRight, Users, TrendingUp, TrendingDown, Minus, Activity, Flame, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClubLogo, PlayerAvatar } from '@/components/media/entity-media';
import { SquadValueChart } from '@/components/club/squad-value-chart';
import { normalizeLanguage, pickLocalizedName, getTranslations, type Language } from '@/lib/i18n';
import { getPlayerPositionAbbreviation } from '@/lib/utils';

type ClubProfileTranslations = ReturnType<typeof getTranslations>['clubProfile'] & {
  incomingTransfers: string;
  outgoingTransfers: string;
};

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
      namePL?: string | null;
      flagUrl: string | null;
    } | null;
  } | null;
  stats: {
    playerCount: number;
    totalMarketValue: string;
    avgMarketValue: string;
  };
  squadValueHistory?: Array<{ year: number; value: number }>;
  players: Array<{
    id: number;
    firstName: string;
    lastName: string;
    shirtNumber: number;
    position: 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD';
    marketValue: string | null;
    imageUrl?: string | null;
    nationality: {
      id: number;
      name: string;
      namePL?: string | null;
      flagUrl: string | null;
    } | null;
    agent: {
      id: number;
      name: string;
      agency: string;
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
        namePL?: string | null;
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
        namePL?: string | null;
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

function getGroupedPositionConfig(language: Language): Array<{ key: ClubProfileData['players'][number]['position']; title: string }> {
  const clubProfile = getTranslations(language).clubProfile;

  return [
    { key: 'GOALKEEPER', title: clubProfile.positionGroups.GOALKEEPER },
    { key: 'DEFENDER', title: clubProfile.positionGroups.DEFENDER },
    { key: 'MIDFIELDER', title: clubProfile.positionGroups.MIDFIELDER },
    { key: 'FORWARD', title: clubProfile.positionGroups.FORWARD },
  ];
}

function formatDate(value: string, language: Language) {
  return new Date(value).toLocaleDateString(language === 'pl' ? 'pl-PL' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatMoney(raw: string | null, language: Language) {
  if (!raw) return language === 'pl' ? 'Brak danych' : 'No data';

  const value = Number(raw);
  if (Number.isNaN(value)) return raw;

  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)} mld €`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} mln €`;

  return `${value.toLocaleString(language === 'pl' ? 'pl-PL' : 'en-GB')} €`;
}

type Trend = 'up' | 'down' | 'neutral';

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

const playerToneByPosition = {
  GOALKEEPER: 'violet',
  DEFENDER: 'orange',
  MIDFIELDER: 'sky',
  FORWARD: 'emerald',
} as const;

// Dodana mapa klas tekstowych dla poszczególnych pozycji
const textToneByPosition = {
  GOALKEEPER: {
    text: 'text-violet-400',
    hover: 'group-hover:text-violet-400',
  },
  DEFENDER: {
    text: 'text-orange-400',
    hover: 'group-hover:text-orange-400',
  },
  MIDFIELDER: {
    text: 'text-sky-400',
    hover: 'group-hover:text-sky-400',
  },
  FORWARD: {
    text: 'text-emerald-400',
    hover: 'group-hover:text-emerald-400',
  },
} as const;

export function ClubProfileView({ club, initialLanguage = 'pl' }: { club: ClubProfileData | null; initialLanguage?: Language }) {
  const [language, setLanguage] = useState<Language>(initialLanguage);

  useEffect(() => {
    const handleLanguageChange = () => {
      const stored = localStorage.getItem('ui-language');
      const normalized = normalizeLanguage(stored);
      setLanguage(normalized);
    };
    window.addEventListener('language-changed', handleLanguageChange);
    return () => window.removeEventListener('language-changed', handleLanguageChange);
  }, []);

  if (!club) {
    return null;
  }

  const t = getTranslations(language).clubProfile as ClubProfileTranslations;

  const incomingTransfers = club.transfersIn
    .map((transfer) => ({
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
      transferType: transfer.transferType,
      direction: 'in' as const,
      date: transfer.date,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const outgoingTransfers = club.transfersOut
    .map((transfer) => ({
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
      transferType: transfer.transferType,
      direction: 'out' as const,
      date: transfer.date,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const logoSrc = club.logoUrl?.trim() || null;
  const leagueLogoSrc = club.league?.logoUrl?.trim() || null;
  const nationalityFlagSrc = club.league?.nationality?.flagUrl?.trim() || null;

  const playersByPosition = getGroupedPositionConfig(language).map((section) => ({
    ...section,
    players: club.players.filter((player) => player.position === section.key).sort((a, b) => a.shirtNumber - b.shirtNumber || a.lastName.localeCompare(b.lastName)),
  }));

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 rounded-xl border border-border/40 bg-card/50 p-6">
        <div className="flex flex-col items-start gap-6 sm:flex-row">
          <ClubLogo name={club.name} logoUrl={logoSrc} className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-none bg-muted" imageClassName="h-full w-full object-contain object-center" iconClassName="h-10 w-10 text-muted-foreground" />

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{club.name}</h1>
              <Badge variant="outline" className="border-sky-500/20 bg-sky-500/10 text-xs text-sky-400">
                {nationalityFlagSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={nationalityFlagSrc} alt={t.country} className="mr-1 h-3.5 w-5 rounded-sm object-cover" />
                ) : (
                  <Shield className="mr-1 h-3.5 w-3.5" />
                )}
                {pickLocalizedName(language, club.league?.nationality) || t.noCountry}
              </Badge>
              <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-300">
                {club.league ? (
                  <Link href={`/leagues/${club.league.id}`} className="inline-flex items-center hover:text-emerald-200">
                    <ClubLogo name={club.league.name} logoUrl={leagueLogoSrc} className="mr-1 flex h-3.5 w-4 shrink-0 items-center justify-center overflow-hidden" imageClassName="h-full w-full object-contain object-center" fallbackClassName="mr-1 flex h-3.5 w-4 shrink-0 items-center justify-center overflow-hidden" iconClassName="h-2.5 w-2.5 text-muted-foreground" />
                    {club.league.name}
                  </Link>
                ) : (
                  <>
                    <Shield className="mr-1 h-3.5 w-3.5" />
                    {t.noLeague}
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
                t.noLeague
              )}
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
              <div className="rounded-lg border border-border/30 bg-background/60 px-3 py-2">
                <p className="mb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{t.league}</p>
                <p className="flex items-center text-base font-bold text-foreground">
                  <ClubLogo name={club.league?.name ?? t.league} logoUrl={leagueLogoSrc} className="mr-2 flex h-4 w-5 shrink-0 items-center justify-center overflow-hidden" imageClassName="h-full w-full object-contain object-center" fallbackClassName="mr-2 flex h-4 w-5 shrink-0 items-center justify-center overflow-hidden" iconClassName="h-3 w-3 text-muted-foreground" />
                  {club.league?.name ?? t.noData}
                </p>
              </div>
              <div className="rounded-lg border border-border/30 bg-background/60 px-3 py-2">
                <p className="mb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{t.country}</p>
                <p className="flex items-center text-base font-bold text-foreground">
                  {nationalityFlagSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={nationalityFlagSrc} alt={t.country} className="mr-2 h-3.5 w-5 rounded-sm object-cover" />
                  ) : (
                    <Shield className="mr-2 h-4 w-4 text-muted-foreground" />
                  )}
                  {pickLocalizedName(language, club.league?.nationality) || t.noData}
                </p>
              </div>
              <div className="rounded-lg border border-border/30 bg-background/60 px-3 py-2">
                <p className="mb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{t.budget}</p>
                <p className="text-base font-bold text-amber-400">{formatMoney(club.budget, language)}</p>
              </div>
              <div className="rounded-lg border border-border/30 bg-background/60 px-3 py-2">
                <p className="mb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{t.squadValue}</p>
                <p className="text-base font-bold text-emerald-400">{formatMoney(club.stats.totalMarketValue, language)}</p>
              </div>
              <div className="rounded-lg border border-border/30 bg-background/60 px-3 py-2">
                <p className="mb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{t.founded}</p>
                <p className="text-base font-bold text-foreground">{t.noData}</p>
              </div>
              <div className="rounded-lg border border-border/30 bg-background/60 px-3 py-2">
                <p className="mb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{t.stadium}</p>
                <p className="text-base font-bold text-foreground">{t.noData}</p>
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
                {t.squadPlayers}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-4 px-4 pb-4">
                {club.players.length === 0 && <div className="px-2 py-2 text-sm text-muted-foreground">{t.playersInClub}</div>}
                {playersByPosition.map((section) => (
                  <div key={section.key} className="overflow-hidden rounded-lg border border-border/30 bg-background/50">
                    <div className="border-b border-border/30 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{section.title}</div>
                    {section.players.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-muted-foreground">{t.playersNone}</div>
                    ) : (
                      <div className="divide-y divide-border/30">
                        {section.players.map((player) => {
                          const playerName = `${player.firstName} ${player.lastName}`.trim();
                          const textClasses = textToneByPosition[player.position];

                          return (
                            <Link key={player.id} href={`/players/${player.id}`} className="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/30">
                              <span className={`w-9 shrink-0 text-right text-xs font-bold ${textClasses.text}`}>#{player.shirtNumber}</span>
                              <PlayerAvatar name={playerName} firstName={player.firstName} lastName={player.lastName} imageUrl={player.imageUrl ?? null} tone={playerToneByPosition[player.position]} className="flex h-12 w-9 shrink-0 items-center justify-center overflow-hidden rounded text-xs font-bold text-white" imageClassName="h-full w-full object-cover object-center" />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className={`truncate text-sm font-medium text-foreground transition-colors ${textClasses.hover}`}>{playerName}</span>
                                  <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">{getPlayerPositionAbbreviation(player.position)}</span>
                                </div>
                                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                                  {player.nationality?.flagUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={player.nationality.flagUrl} alt={player.nationality.name} className="h-3.5 w-5 rounded-sm object-cover" />
                                  ) : (
                                    <Shield className="h-3.5 w-3.5" />
                                  )}
                                  <span>{pickLocalizedName(language, player.nationality) || t.noNationality}</span>
                                </div>
                              </div>
                              <div className="flex shrink-0 items-center gap-2">
                                <span className={`text-sm font-semibold ${textClasses.text}`}>{formatMoney(player.marketValue, language)}</span>
                                <ArrowRight className={`h-3.5 w-3.5 text-muted-foreground transition-colors ${textClasses.hover}`} />
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

          <div className="flex flex-col gap-6">
            <Card className="border-border/40 bg-card/50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <ArrowRight className="h-4 w-4 text-emerald-400" />
                  {t.incomingTransfers}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/30">
                  {incomingTransfers.length === 0 && <div className="px-6 py-4 text-sm text-muted-foreground">{t.transferHistoryNone}</div>}
                  {incomingTransfers.map((transfer) => {
                    const trend = getTrend(transfer.transferType, transfer.fee);
                    const feeLabel = transfer.transferType === 'FREE' ? '0M €' : formatMoney(transfer.fee, language);

                    return (
                      <div key={transfer.id} className="flex items-center gap-4 px-6 py-3.5">
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
                              <ClubLogo name={transfer.fromClub?.name ?? t.noClub} logoUrl={transfer.fromClub?.logoUrl ?? null} className="flex h-3.5 w-3.5 shrink-0 items-center justify-center overflow-hidden rounded-none bg-muted" imageClassName="h-full w-full object-contain object-center" iconClassName="h-2.5 w-2.5 text-muted-foreground" />
                              {transfer.fromClub ? (
                                <Link href={`/clubs/${transfer.fromClub.id}`} className="max-w-40 truncate transition-colors hover:text-foreground">
                                  {transfer.fromClub.name}
                                </Link>
                              ) : (
                                <span className="max-w-40 truncate">{t.noClub}</span>
                              )}
                            </span>
                            <ArrowRight className="h-3 w-3 shrink-0" />
                            <span className="inline-flex items-center gap-1 rounded-full border border-border/40 bg-background/70 px-2 py-0.5">
                              <ClubLogo name={transfer.toClub.name} logoUrl={transfer.toClub.logoUrl} className="flex h-3.5 w-3.5 shrink-0 items-center justify-center overflow-hidden rounded-none bg-muted" imageClassName="h-full w-full object-contain object-center p-0.5" iconClassName="h-2.5 w-2.5 text-muted-foreground" />
                              <Link href={`/clubs/${transfer.toClub.id}`} className="max-w-40 truncate transition-colors hover:text-foreground">
                                {transfer.toClub.name}
                              </Link>
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{formatDate(transfer.date, language)}</span>
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
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <ArrowRight className="h-4 w-4 text-rose-400" />
                  {t.outgoingTransfers}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/30">
                  {outgoingTransfers.length === 0 && <div className="px-6 py-4 text-sm text-muted-foreground">{t.transferHistoryNone}</div>}
                  {outgoingTransfers.map((transfer) => {
                    const trend = getTrend(transfer.transferType, transfer.fee);
                    const feeLabel = transfer.transferType === 'FREE' ? '0M €' : formatMoney(transfer.fee, language);

                    return (
                      <div key={transfer.id} className="flex items-center gap-4 px-6 py-3.5">
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
                              <ClubLogo name={transfer.fromClub?.name ?? t.noClub} logoUrl={transfer.fromClub?.logoUrl ?? null} className="flex h-3.5 w-3.5 shrink-0 items-center justify-center overflow-hidden rounded-none bg-muted" imageClassName="h-full w-full object-contain object-center" iconClassName="h-2.5 w-2.5 text-muted-foreground" />
                              <Link href={`/clubs/${transfer.fromClub.id}`} className="max-w-40 truncate transition-colors hover:text-foreground">
                                {transfer.fromClub.name}
                              </Link>
                            </span>
                            <ArrowRight className="h-3 w-3 shrink-0" />
                            <span className="inline-flex items-center gap-1 rounded-full border border-border/40 bg-background/70 px-2 py-0.5">
                              <ClubLogo name={transfer.toClub.name} logoUrl={transfer.toClub.logoUrl} className="flex h-3.5 w-3.5 shrink-0 items-center justify-center overflow-hidden rounded-none bg-muted" imageClassName="h-full w-full object-contain object-center p-0.5" iconClassName="h-2.5 w-2.5 text-muted-foreground" />
                              <Link href={`/clubs/${transfer.toClub.id}`} className="max-w-40 truncate transition-colors hover:text-foreground">
                                {transfer.toClub.name}
                              </Link>
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{formatDate(transfer.date, language)}</span>
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
          </div>

          <Card className="border-border/40 bg-card/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Flame className="h-4 w-4 text-orange-400" />
                {t.rumours}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-4 text-sm text-muted-foreground">{t.rumoursMissing}</CardContent>
          </Card>

          <Card className="border-border/40 bg-card/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Activity className="h-4 w-4 text-rose-400" />
                {t.injuries}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-4 text-sm text-muted-foreground">{t.injuriesMissing}</CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <SquadValueChart language={language} valuations={club.squadValueHistory ?? []} />

          <Card className="border-border/40 bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                {t.squadStats}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-border/30 bg-background/60 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t.playersCount}</p>
                <p className="text-base font-bold text-foreground">{club.stats.playerCount}</p>
              </div>
              <div className="rounded-lg border border-border/30 bg-background/60 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t.averagePlayerValue}</p>
                <p className="text-base font-bold text-foreground">{formatMoney(club.stats.avgMarketValue, language)}</p>
              </div>
              <div className="rounded-lg border border-border/30 bg-background/60 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t.squadValue}</p>
                <p className="text-base font-bold text-emerald-400">{formatMoney(club.stats.totalMarketValue, language)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
