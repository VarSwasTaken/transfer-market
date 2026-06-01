import Link from 'next/link';
import { ArrowRight, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getClubValuations } from '@/lib/services/rankings';
import { ClubLogo } from '@/components/media/entity-media';

export async function TopClubs() {
  const result = await getClubValuations({ page: 1, limit: 5 });

  if (result.data.length === 0) {
    return null;
  }

  const MAX = Math.max(...result.data.map((c) => parseInt(c.squadsValue.replace(/[^0-9]/g, '')) || 0)) || 1480;

  return (
    <Card className="bg-card/50 border-border/40">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Building2 className="h-4 w-4 text-sky-400" />
          Top wyceniane kluby
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 -mr-2" asChild>
          <Link href="/rankings/most-expensive-clubs">
            Więcej <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {result.data.map((c, i) => {
          const valueNum = parseInt(c.squadsValue.replace(/[^0-9]/g, '')) || 0;
          return (
            <Link key={c.id} href={`/clubs/${c.id}`} className="group flex items-center gap-3">
              <span className="w-5 text-xs font-bold text-muted-foreground text-right shrink-0">{i + 1}</span>
              <ClubLogo name={c.name} logoUrl={c.logoUrl} className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-none bg-muted" imageClassName="h-full w-full object-contain object-center" iconClassName="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground group-hover:text-emerald-400 transition-colors truncate">{c.name}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                  <ClubLogo name={c.league.name} logoUrl={c.league.logoUrl} className="flex h-3.5 w-5 shrink-0 items-center justify-center overflow-hidden" imageClassName="h-full w-full object-contain object-center" fallbackClassName="flex h-3.5 w-5 shrink-0 items-center justify-center overflow-hidden" iconClassName="h-2.5 w-2.5 text-muted-foreground" />
                  <span className="truncate">{c.league.name}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <Progress value={(valueNum / MAX) * 100} className="h-1 flex-1 bg-muted [&>div]:bg-sky-500" />
                  <span className="ml-2 shrink-0 text-xs font-semibold text-sky-400">{c.squadsValue}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
