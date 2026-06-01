'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClubLogo } from '@/components/media/entity-media';
import { normalizeLanguage, getTranslations, type Language } from '@/lib/i18n';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import type { ClubValuationItem } from '@/lib/services/rankings';

export default function ClubValuationsPage() {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams?.get('page') || '1', 10);

  const [language, setLanguage] = useState<Language>(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('ui-language') : null;
    return normalizeLanguage(stored);
  });
  const [data, setData] = useState<ClubValuationItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleLanguageChange = () => {
      const stored = localStorage.getItem('ui-language');
      const normalized = normalizeLanguage(stored);
      setLanguage(normalized);
    };
    window.addEventListener('language-changed', handleLanguageChange);
    return () => window.removeEventListener('language-changed', handleLanguageChange);
  }, []);

  useEffect(() => {
    const handleLanguageChange = () => {
      const stored = localStorage.getItem('ui-language');
      const normalized = normalizeLanguage(stored);
      setLanguage(normalized);
    };
    window.addEventListener('language-changed', handleLanguageChange);
    return () => window.removeEventListener('language-changed', handleLanguageChange);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '20',
        });

        const response = await fetch(`/api/v1/rankings/club-valuations?${params}`);
        const result = await response.json();
        setData(result.data || []);
        setTotalPages(result.meta?.totalPages || 0);
      } catch (error) {
        console.error('Error fetching club valuations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page]);

  const t = getTranslations(language).rankings;
  const currentUrl = `/rankings/most-expensive-clubs`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t.clubValuations}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.clubValuationsDesc}</p>
        </div>
      </div>

      {/* Table */}
      <Card className="border-border/40 bg-card/50">
        <CardContent className="p-0">
          {loading ? (
            <div className="px-6 py-8 text-center text-muted-foreground">{t.loading}</div>
          ) : data.length === 0 ? (
            <div className="px-6 py-8 text-center text-muted-foreground">{t.noData}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/30 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">{t.club}</th>
                    <th className="px-4 py-3">{t.league}</th>
                    <th className="px-4 py-3 text-center">{t.squadsValue}</th>
                    <th className="px-4 py-3 text-center">{t.players}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {data.map((club) => (
                    <tr key={club.id} className="hover:bg-emerald-500/5 transition-colors">
                      <td className="px-4 py-3 font-semibold text-emerald-400">{club.rank}</td>
                      <td className="px-4 py-3">
                        <Link href={`/clubs/${club.id}`} className="flex items-center gap-2 group text-sm hover:text-emerald-400 transition-colors">
                          <ClubLogo name={club.name} logoUrl={club.logoUrl} className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-none bg-muted" imageClassName="h-full w-full object-contain object-center p-0.5" iconClassName="h-4 w-4 text-muted-foreground" />
                          <span className="truncate group-hover:underline">{club.name}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/leagues/${club.league.slug}`} className="text-sm text-foreground hover:text-emerald-400 transition-colors group">
                          <div className="flex items-center gap-2">
                            <ClubLogo name={club.league.name} logoUrl={club.league.logoUrl} className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden" imageClassName="h-full w-full object-contain object-center" fallbackClassName="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden" iconClassName="h-3 w-3 text-muted-foreground" />
                            <span className="truncate group-hover:underline">{club.league.name}</span>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-semibold text-emerald-400 text-center">{club.squadsValue}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground text-center">{club.playerCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t.page} {page} {t.of} {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => {
                const params = new URLSearchParams({ page: (page - 1).toString() });
                window.location.href = `${currentUrl}?${params}`;
              }}
              className="gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.previous}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => {
                const params = new URLSearchParams({ page: (page + 1).toString() });
                window.location.href = `${currentUrl}?${params}`;
              }}
              className="gap-1"
            >
              {t.next}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
