'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ClubLogo, PlayerAvatar } from '@/components/media/entity-media';
import { getPlayerPositionAbbreviation } from '@/lib/utils';

type PlayerTone = 'emerald' | 'orange' | 'blue' | 'sky' | 'violet';

const playerToneByPosition: Record<string, PlayerTone> = {
  GOALKEEPER: 'violet',
  DEFENDER: 'orange',
  MIDFIELDER: 'sky',
  FORWARD: 'emerald',
};

const formatTransferFee = (fee: string): string => {
  const num = Number(fee);
  if (num === 0) return 'Za darmo';
  if (num >= 1000000) return `€${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `€${(num / 1000).toFixed(0)}K`;
  return `€${num}`;
};

// Zmieniono: usunięto parametry windowStart i windowEnd
export default function TransfersClient() {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams?.get('page') || '1', 10);

  const [data, setData] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '50', // Pobieramy 50 transferów na jedną stronę
        });

        const response = await fetch(`/api/v1/transfers?${params.toString()}`);
        const result = await response.json();
        setData(result.data || []);
        setMeta(result.meta || {});
      } catch (error) {
        console.error('Błąd pobierania transferów:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page]); // useEffect reaguje teraz tylko na zmianę strony

  const buildQueryString = (pageNum: number) => {
    const query = new URLSearchParams();
    query.set('page', String(pageNum));
    return `/transfers?${query.toString()}`;
  };

  return (
    <>
      <Card className="border-border/40 bg-card/50">
        <CardContent className="p-0">
          {loading ? (
            <div className="px-6 py-8 text-center text-muted-foreground">Ładowanie transferów...</div>
          ) : data.length === 0 ? (
            <div className="px-6 py-8 text-center text-muted-foreground">Brak transferów</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/30 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    <th className="px-4 py-3">Zawodnik</th>
                    <th className="px-4 py-3 text-center">Pozycja</th>
                    <th className="px-4 py-3">Z</th>
                    <th className="px-4 py-3">Do</th>
                    <th className="px-4 py-3 text-center">Kwota</th>
                    <th className="px-4 py-3 text-right">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {data.map((transfer) => {
                    const avatarTone = playerToneByPosition[transfer.playerPosition] || 'emerald';

                    return (
                      <tr key={transfer.id} className="hover:bg-emerald-500/5 transition-colors">
                        <td className="px-4 py-3">
                          <Link href={`/players/${transfer.playerId}`} className="flex items-center gap-3 group text-sm hover:text-emerald-400 transition-colors">
                            <PlayerAvatar name={transfer.playerName} imageUrl={transfer.playerImageUrl} tone={avatarTone} className="flex h-12 w-9 shrink-0 items-center justify-center overflow-hidden rounded text-xs font-bold" imageClassName="h-full w-full object-cover object-center" />
                            <div className="flex flex-col min-w-0">
                              <span className="truncate group-hover:underline font-medium">{transfer.playerName}</span>
                              {transfer.playerNationalityFlag && (
                                <div className="mt-0.5 flex items-center gap-1.5">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={transfer.playerNationalityFlag} alt={transfer.playerNationalityName || 'Kraj'} className="h-3 w-4 rounded-sm shrink-0 object-cover" />
                                  {transfer.playerNationalityName && <span className="text-xs text-muted-foreground truncate">{transfer.playerNationalityName}</span>}
                                </div>
                              )}
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-block px-1.5 py-0.5 rounded bg-muted text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{getPlayerPositionAbbreviation(transfer.playerPosition)}</span>
                        </td>
                        <td className="px-4 py-3">
                          {transfer.fromClubId ? (
                            <Link href={`/clubs/${transfer.fromClubId}`} className="flex items-center gap-2 group text-sm text-foreground hover:text-emerald-400 transition-colors">
                              <ClubLogo name={transfer.fromClubName} logoUrl={transfer.fromClubLogoUrl} className="h-6 w-6" />
                              <span className="truncate group-hover:underline">{transfer.fromClubName}</span>
                            </Link>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/clubs/${transfer.toClubId}`} className="flex items-center gap-2 group text-sm text-foreground hover:text-emerald-400 transition-colors">
                            <ClubLogo name={transfer.toClubName} logoUrl={transfer.toClubLogoUrl} className="h-6 w-6" />
                            <span className="truncate group-hover:underline">{transfer.toClubName}</span>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-center font-semibold text-emerald-400">{formatTransferFee(transfer.fee)}</td>
                        <td className="px-4 py-3 text-right text-sm text-muted-foreground">{new Date(transfer.date).toLocaleDateString('pl-PL')}</td>
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
      {meta?.totalPages && meta.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <Link href={buildQueryString(Math.max(1, page - 1))} className={page === 1 ? 'pointer-events-none opacity-50' : ''}>
            <Button variant="outline" size="icon" disabled={page === 1}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Strona {meta.page} z {meta.totalPages}
            </span>
          </div>

          <Link href={buildQueryString(Math.min(meta.totalPages, page + 1))} className={page === meta.totalPages ? 'pointer-events-none opacity-50' : ''}>
            <Button variant="outline" size="icon" disabled={page === meta.totalPages}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </>
  );
}
