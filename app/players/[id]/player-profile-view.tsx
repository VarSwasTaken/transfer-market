'use client';

import Link from 'next/link';
import { ArrowRight, Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ValueChart } from '@/components/player/value-chart';
import { ClubLogo, PlayerAvatar } from '@/components/media/entity-media';
import { normalizeLanguage, pickLocalizedName, getTranslations, type Language } from '@/lib/i18n';

type Trend = 'up' | 'down' | 'neutral';

type PlayerProfileData = {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: string;
  shirtNumber: number;
  position: 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD';
  preferredFoot: 'LEFT' | 'RIGHT' | 'BOTH';
  height: number | null;
  weight: number | null;
  marketValue: string | null;
  imageUrl: string | null;
  nationality: { id: number; name: string; namePL?: string | null; flagUrl: string | null } | null;
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
    type_PL: string;
    type_EN: string;
    severity: 'Lekka' | 'Średnia' | 'Poważna' | 'Krytyczna';
    startDate: string;
    expectedReturnDate: string | null;
    actualReturnDate: string | null;
    description_PL: string | null;
    description_EN: string | null;
    treatment_PL: string | null;
    treatment_EN: string | null;
  }>;
  valuations: Array<{ year: number; month: number; value: number; currency?: string }>;
};

function getSeverityConfig(language: Language) {
  return {
    Lekka: { label: language === 'pl' ? 'Lekka' : 'Minor', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
    Średnia: { label: language === 'pl' ? 'Średnia' : 'Moderate', className: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
    Poważna: { label: language === 'pl' ? 'Poważna' : 'Serious', className: 'bg-rose-500/15 text-rose-400 border-rose-500/20' },
    Krytyczna: { label: language === 'pl' ? 'Krytyczna' : 'Critical', className: 'bg-rose-500/15 text-rose-400 border-rose-500/20' },
  } as const;
}

function getTypeConfig(language: Language) {
  return {
    PERMANENT: { label: language === 'pl' ? 'Transfer' : 'Transfer', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
    LOAN: { label: language === 'pl' ? 'Wypożyczenie' : 'Loan', className: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
    FREE: { label: language === 'pl' ? 'Wolny transfer' : 'Free transfer', className: 'bg-sky-500/15 text-sky-400 border-sky-500/20' },
  } as const;
}

const positionLabel: Record<PlayerProfileData['position'], { full: { pl: string; en: string }; short: string }> = {
  GOALKEEPER: { full: { pl: 'Bramkarz', en: 'Goalkeeper' }, short: 'GK' },
  DEFENDER: { full: { pl: 'Obrońca', en: 'Defender' }, short: 'DF' },
  MIDFIELDER: { full: { pl: 'Pomocnik', en: 'Midfielder' }, short: 'MF' },
  FORWARD: { full: { pl: 'Napastnik', en: 'Forward' }, short: 'FW' },
};

const preferredFootLabel: Record<PlayerProfileData['preferredFoot'], { pl: string; en: string }> = {
  LEFT: { pl: 'Lewa', en: 'Left' },
  RIGHT: { pl: 'Prawa', en: 'Right' },
  BOTH: { pl: 'Obie', en: 'Both' },
};

function formatDate(value: string, language: Language) {
  return new Date(value).toLocaleDateString(language === 'pl' ? 'pl-PL' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatMonthYear(value: string, language: Language) {
  return new Date(value).toLocaleDateString(language === 'pl' ? 'pl-PL' : 'en-GB', {
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

function formatMarketValue(raw: string | null, language: Language) {
  if (!raw) {
    return language === 'pl' ? 'Brak danych' : 'No data';
  }

  const numericValue = Number(raw);
  if (Number.isNaN(numericValue)) {
    return raw;
  }

  if (numericValue >= 1_000_000) {
    return `${Math.round(numericValue / 1_000_000)} mln €`;
  }

  return `${numericValue.toLocaleString(language === 'pl' ? 'pl-PL' : 'en-GB')} €`;
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

export function PlayerProfileView({ player }: { player: PlayerProfileData | null }) {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('ui-language') : null;
    return normalizeLanguage(stored);
  });

  // Listen for language changes from navbar
  useEffect(() => {
    const handleLanguageChange = () => {
      const stored = localStorage.getItem('ui-language');
      const normalized = normalizeLanguage(stored);
      setLanguage(normalized);
    };
    window.addEventListener('language-changed', handleLanguageChange);
    return () => window.removeEventListener('language-changed', handleLanguageChange);
  }, []);

  if (!player) {
    return null;
  }

  const t = getTranslations(language).playerProfile;
  const name = `${player.firstName} ${player.lastName}`.trim();
  const age = calculateAge(player.birthDate);
  const position = positionLabel[player.position];
  const preferredFoot = preferredFootLabel[player.preferredFoot];
  const severityConfig = getSeverityConfig(language);
  const typeConfig = getTypeConfig(language);
  const marketValue = formatMarketValue(player.marketValue, language);
  const contractEnd = player.contracts[0]?.endDate ? formatMonthYear(player.contracts[0].endDate, language) : t.noData;
  const avatarSrc = player.imageUrl?.trim() || null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 rounded-xl border border-border/40 bg-card/50 p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <PlayerAvatar name={name} firstName={player.firstName} lastName={player.lastName} imageUrl={avatarSrc} tone="emerald" className="flex aspect-300/390 w-30 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-lg shadow-emerald-900/30" textClassName="text-4xl font-extrabold text-white" imageClassName="h-full w-full object-cover object-center" />

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{name}</h1>
              <span className="rounded border border-emerald-500/20 bg-emerald-500/15 px-2 py-1 text-xs font-bold text-emerald-400">#{player.shirtNumber}</span>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              <div className="rounded-lg border border-border/30 bg-background/60 px-3 py-2">
                <p className="mb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{t.marketValue}</p>
                <p className="text-base font-bold text-emerald-400">{marketValue}</p>
              </div>
              <div className="rounded-lg border border-border/30 bg-background/60 px-3 py-2">
                <p className="mb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{t.position}</p>
                <p className="text-base font-bold text-foreground">{position.full[language]}</p>
              </div>
              <div className="rounded-lg border border-border/30 bg-background/60 px-3 py-2">
                <p className="mb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{t.preferredFoot}</p>
                <p className="text-base font-bold text-foreground">{preferredFoot[language]}</p>
              </div>
              <div className="rounded-lg border border-border/30 bg-background/60 px-3 py-2">
                <p className="mb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{t.age}</p>
                <p className="text-base font-bold text-foreground">
                  {age} {t.yearsOld}
                </p>
              </div>
              <div className="rounded-lg border border-border/30 bg-background/60 px-3 py-2">
                <p className="mb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{t.height}</p>
                <p className="text-base font-bold text-foreground">{player.height ? `${player.height} cm` : t.noData}</p>
              </div>
              <div className="rounded-lg border border-border/30 bg-background/60 px-3 py-2">
                <p className="mb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{t.weight}</p>
                <p className="text-base font-bold text-foreground">{player.weight ? `${player.weight} kg` : t.noData}</p>
              </div>
              <div className="rounded-lg border border-border/30 bg-background/60 px-3 py-2">
                <p className="mb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{t.currentClub}</p>
                {player.club ? (
                  <div className="flex items-center gap-2">
                    <ClubLogo name={player.club.name} logoUrl={player.club.logoUrl} className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-none bg-muted" imageClassName="h-full w-full object-contain object-center" iconClassName="h-3.5 w-3.5 text-muted-foreground" />
                    <Link href={`/clubs/${player.club.id}`} className="text-base font-bold text-foreground transition-colors hover:text-emerald-400">
                      {player.club.name}
                    </Link>
                  </div>
                ) : (
                  <p className="text-base font-bold text-foreground">{t.noClub}</p>
                )}
              </div>
              <div className="rounded-lg border border-border/30 bg-background/60 px-3 py-2">
                <p className="mb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{t.nationality}</p>
                {player.nationality ? (
                  <div className="flex items-center gap-2">
                    {player.nationality.flagUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={player.nationality.flagUrl} alt={pickLocalizedName(language, player.nationality)} className="h-4 w-6 shrink-0 rounded-sm object-cover" />
                    ) : null}
                    <p className="text-base font-bold text-foreground">{pickLocalizedName(language, player.nationality)}</p>
                  </div>
                ) : (
                  <p className="text-base font-bold text-foreground">{t.noData}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <span className="text-muted-foreground">
                {t.agent}: {player.agent ? <span className="font-medium text-foreground">{player.agent.name}</span> : <span className="font-medium text-foreground">{t.noData}</span>}{' '}
              </span>
              <span className="text-muted-foreground">
                {t.born}:{' '}
                <span className="font-medium text-foreground">
                  {formatDate(player.birthDate, language)} ({age} {t.yearsOld})
                </span>
              </span>
              <span className="text-muted-foreground">
                {t.contractUntil}: <span className="font-medium text-foreground">{contractEnd}</span>
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
                {t.transferHistory}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/30">
                {player.transfers.length === 0 && (
                  <div key="no-transfers" className="px-6 py-4 text-sm text-muted-foreground">
                    {t.noTransferHistory}
                  </div>
                )}
                {player.transfers.map((transfer, index) => {
                  const trend = getTrend(transfer.transferType, transfer.fee);
                  const feeLabel = transfer.transferType === 'FREE' ? '0M €' : transfer.transferType === 'LOAN' ? t.loan : formatMarketValue(transfer.fee, language);

                  return (
                    <div key={`transfer-${transfer.id || 'new'}-${index}`} className="flex items-center gap-4 px-6 py-3.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 text-sm">
                          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                            <ClubLogo name={transfer.fromClub?.name ?? t.noFromClub} logoUrl={transfer.fromClub?.logoUrl ?? null} className="flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-none bg-muted" imageClassName="h-full w-full object-contain object-center" iconClassName="h-2.5 w-2.5 text-muted-foreground" />
                            {transfer.fromClub ? (
                              <Link href={`/clubs/${transfer.fromClub.id}`} className="transition-colors hover:text-emerald-400">
                                {transfer.fromClub.name}
                              </Link>
                            ) : (
                              t.noFromClub
                            )}
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                            <ClubLogo name={transfer.toClub.name} logoUrl={transfer.toClub.logoUrl} className="flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-none bg-muted" imageClassName="h-full w-full object-contain object-center" iconClassName="h-2.5 w-2.5 text-muted-foreground" />
                            <Link href={`/clubs/${transfer.toClub.id}`} className="transition-colors hover:text-emerald-400">
                              {transfer.toClub.name}
                            </Link>
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="outline" className={`px-1.5 py-0 text-[10px] ${typeConfig[transfer.transferType].className}`}>
                            {typeConfig[transfer.transferType].label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{formatMonthYear(transfer.date, language)}</span>
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
                {t.injuryHistory}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/30">
                {player.injuries.length === 0 && (
                  <div key="no-injuries" className="px-6 py-4 text-sm text-muted-foreground">
                    {t.noInjuryHistory}
                  </div>
                )}
                {player.injuries.map((injury, index) => (
                  <div key={`injury-${injury.id || 'new'}-${index}`} className="flex items-center gap-4 px-6 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{language === 'pl' ? injury.type_PL || injury.type_EN || 'Unknown' : injury.type_EN || injury.type_PL || 'Unknown'}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDate(injury.startDate, language)} &ndash; {injury.actualReturnDate ? formatDate(injury.actualReturnDate, language) : injury.expectedReturnDate ? formatDate(injury.expectedReturnDate, language) : t.noReturnDate}
                      </p>
                      {(language === 'pl' ? injury.description_PL : injury.description_EN) && <p className="mt-1.5 text-xs text-muted-foreground">{language === 'pl' ? injury.description_PL : injury.description_EN}</p>}
                      {(language === 'pl' ? injury.treatment_PL : injury.treatment_EN) && <p className="mt-1 text-xs text-muted-foreground italic">{language === 'pl' ? injury.treatment_PL : injury.treatment_EN}</p>}
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
          <ValueChart language={language} valuations={player.valuations} />
        </div>
      </div>
    </div>
  );
}
