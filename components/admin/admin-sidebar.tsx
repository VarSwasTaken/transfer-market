'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Users, Trophy, Shield, Flag, UserRound, Home, FileText, ArrowRightLeft, TrendingUp, Activity, MessageSquare } from 'lucide-react';

import { logoutAction } from '@/app/admin/logout-action';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Ligi', href: '/admin/leagues', icon: Trophy },
  { name: 'Kluby', href: '/admin/clubs', icon: Shield },
  { name: 'Zawodnicy', href: '/admin/players', icon: Users },
  { name: 'Agenci', href: '/admin/agents', icon: UserRound },
  { name: 'Kontrakty', href: '/admin/contracts', icon: FileText },
  { name: 'Transfery', href: '/admin/transfers', icon: ArrowRightLeft },
  { name: 'Plotki', href: '/admin/transfer-rumors', icon: MessageSquare },
  { name: 'Wyceny Zawodników', href: '/admin/player-valuations', icon: TrendingUp },
  { name: 'Wyceny Klubów', href: '/admin/club-valuations', icon: TrendingUp },
  { name: 'Kontuzje', href: '/admin/injuries', icon: Activity },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card border-r border-border h-full min-h-screen p-4 flex flex-col hidden md:flex">
      <div className="mb-8 px-4">
        <h2 className="text-xl font-bold text-emerald-500">Panel Admina</h2>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link key={item.name} href={item.href} className={cn('flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors', isActive ? 'bg-emerald-500/10 text-emerald-500' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground')}>
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-4 pt-4 border-t border-border">
        <form action={logoutAction}>
          <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-md transition-colors text-sm font-medium">
            Wyloguj
          </button>
        </form>
      </div>
    </aside>
  );
}
