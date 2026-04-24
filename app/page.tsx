import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { RecentTransfers } from '@/components/home/recent-transfers';
import { TopPlayers } from '@/components/home/top-players';
import { TopClubs } from '@/components/home/top-clubs';
import { HotRumours } from '@/components/home/hot-rumours';
import { InjuredPlayers } from '@/components/home/injured-players';
import { HottestRumour } from '@/components/home/hottest-rumour';
import { TransferWindows } from '@/components/home/transfer-windows';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/hero-stadium.jpg" alt="Stadion piłkarski" fill className="object-cover object-center opacity-20" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-12 md:py-16">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground text-balance mb-3">
              Rynek transferowy
              <span className="text-emerald-400"> w jednym miejscu</span>
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed mb-6 max-w-xl">Sledz transfery, monitoruj wyceny zawodnikow i analizuj rynek pilkarski.</p>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-muted-foreground">Popularne:</span>
              {[
                { label: 'Wolni agenci', href: '/zawodnicy/wolni-agenci' },
                { label: 'Ekstraklasa', href: '/ligi/ekstraklasa' },
                { label: 'Premier League', href: '/ligi/premier-league' },
                { label: 'Zimowe okienko', href: '/transfery/okienka/zima-2025' },
                { label: 'Rankingi', href: '/rankingi' },
              ].map((link) => (
                <Link key={link.href} href={link.href} className="text-xs rounded-full border border-border/50 bg-card/50 px-3 py-1 text-muted-foreground hover:text-emerald-400 hover:border-emerald-500/40 transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Transfer dnia banner */}
        <div className="mb-6 rounded-xl overflow-hidden border border-emerald-500/20 bg-gradient-to-r from-emerald-950/60 to-card/60 relative">
          <div className="absolute inset-0 opacity-10">
            <Image src="/images/transfer-bg.jpg" alt="" fill className="object-cover object-center" />
          </div>
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-sm shrink-0">MF</div>
              <div>
                <p className="text-xs text-emerald-400 font-medium uppercase tracking-wider">Transfer dnia</p>
                <p className="font-bold text-foreground">Marcelo Ferreira &rarr; Manchester City</p>
                <p className="text-sm text-muted-foreground">Sporting CP &middot; LW &middot; 23 lata</p>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-400">€ 87 mln</p>
                <p className="text-xs text-muted-foreground">kwota transferu</p>
              </div>
              <Button variant="outline" size="sm" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10" asChild>
                <Link href="/zawodnik/1">
                  Profil <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Main 3-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT — wide column (gorące plotki + ostatnie transfery + kontuzjowani) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <HottestRumour />
            <TransferWindows />
            <HotRumours />
            <RecentTransfers />
            <InjuredPlayers />
          </div>

          {/* RIGHT — sidebar (top wyceny + top kluby) */}
          <div className="flex flex-col gap-6">
            <TopPlayers />
            <TopClubs />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
