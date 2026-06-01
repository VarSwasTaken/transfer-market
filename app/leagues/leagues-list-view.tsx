'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ClubLogo } from '@/components/media/entity-media';

type LeagueListItem = {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
  clubsCount: number;
  nationality: {
    id: number;
    name: string;
    flagUrl: string | null;
  };
};

type Meta = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

export function LeaguesListView({ leagues, meta }: { leagues: LeagueListItem[]; meta: Meta }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Ligi piłkarskie</h1>
        <p className="text-muted-foreground">Przeglądaj światowe ligi i ich kluby</p>
      </div>

      {/* Leagues Grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {leagues.map((league) => (
          <Link key={league.id} href={`/leagues/${league.slug}`}>
            <Card className="h-full hover:border-emerald-500/40 transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center gap-4">
                  {/* Logo */}
                  <ClubLogo name={league.name} logoUrl={league.logoUrl} className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-none" imageClassName="h-full w-full object-contain object-center p-2" fallbackClassName="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden" iconClassName="h-7 w-7 text-muted-foreground" />

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold text-foreground truncate">{league.name}</h2>
                    {league.nationality && (
                      <div className="flex items-center justify-center gap-1 mt-2">
                        {league.nationality.flagUrl && <Image src={league.nationality.flagUrl} alt={league.nationality.name} width={16} height={12} className="w-4 h-3 rounded-sm object-cover" />}
                        <span className="text-sm text-muted-foreground">{league.nationality.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="w-full pt-3 border-t border-border/20">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Kluby: </span>
                      <span className="font-semibold text-emerald-400">{league.clubsCount}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Link href={`/leagues?page=${meta.page - 1}`} className={meta.page === 1 ? 'pointer-events-none opacity-50' : ''}>
            <Button variant="outline" size="icon" disabled={meta.page === 1}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Strona {meta.page} z {meta.totalPages}
            </span>
          </div>

          <Link href={`/leagues?page=${meta.page + 1}`} className={meta.page === meta.totalPages ? 'pointer-events-none opacity-50' : ''}>
            <Button variant="outline" size="icon" disabled={meta.page === meta.totalPages}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
