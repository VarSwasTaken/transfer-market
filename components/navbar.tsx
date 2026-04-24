'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Search, Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const secondaryNav = [
  {
    label: 'Transfery',
    href: '/transfery',
    sub: [
      { label: 'Transfery definitywne', href: '/transfery/definitywne' },
      { label: 'Plotki transferowe', href: '/transfery/plotki' },
      { label: 'Historyczne okienka', href: '/transfery/okienka' },
    ],
  },
  {
    label: 'Rankingi',
    href: '/rankingi',
    sub: [
      { label: 'Najdroższe transfery', href: '/rankingi/najdrozsze' },
      { label: 'Top wyceniani piłkarze', href: '/rankingi/wyceny-pilkarze' },
      { label: 'Top wyceniane kluby', href: '/rankingi/wyceny-kluby' },
    ],
  },
  {
    label: 'Ligi',
    href: '/ligi',
    sub: [
      { label: 'Premier League', href: '/ligi/premier-league' },
      { label: 'La Liga', href: '/ligi/la-liga' },
      { label: 'Bundesliga', href: '/ligi/bundesliga' },
      { label: 'Serie A', href: '/ligi/serie-a' },
      { label: 'Ligue 1', href: '/ligi/ligue-1' },
      { label: 'Ekstraklasa', href: '/ligi/ekstraklasa' },
      { label: 'Więcej lig...', href: '/ligi' },
    ],
  },
  {
    label: 'Zawodnicy',
    href: '/zawodnicy',
    sub: [
      { label: 'Przeglądaj zawodników', href: '/zawodnicy' },
      { label: 'Wolni agenci', href: '/zawodnicy/wolni-agenci' },
    ],
  },
];

const searchScopes = [
  { label: 'Wszystko', value: 'all' },
  { label: 'Zawodnicy', value: 'zawodnicy' },
  { label: 'Kluby', value: 'kluby' },
  { label: 'Agenci', value: 'agenci' },
  { label: 'Ligi', value: 'ligi' },
];

function SearchBar({ className }: { className?: string }) {
  const [scope, setScope] = useState(searchScopes[0]);
  const [scopeOpen, setScopeOpen] = useState(false);
  const [query, setQuery] = useState('');
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setScopeOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className={cn('relative flex items-center rounded-lg border border-border/60 bg-muted/40 overflow-visible focus-within:ring-2 focus-within:ring-emerald-500/40 focus-within:border-emerald-500/40 transition-all', className)}>
      {/* Scope selector */}
      <div className="relative shrink-0" ref={dropRef}>
        <button onClick={() => setScopeOpen(!scopeOpen)} className="flex cursor-pointer items-center gap-1 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground border-r border-border/60 whitespace-nowrap transition-colors">
          {scope.label}
          <ChevronDown className="h-3 w-3" />
        </button>
        {scopeOpen && (
          <div className="absolute top-full left-0 mt-1 w-36 rounded-md border border-border/60 bg-popover shadow-lg z-50 py-1">
            {searchScopes.map((s) => (
              <button
                key={s.value}
                onClick={() => {
                  setScope(s);
                  setScopeOpen(false);
                }}
                className={cn('w-full cursor-pointer text-left px-3 py-1.5 text-sm transition-colors hover:bg-muted', scope.value === s.value ? 'text-emerald-400' : 'text-muted-foreground')}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Szukaj ${scope.value === 'all' ? 'zawodników, klubów, lig...' : scope.label.toLowerCase() + '...'}`} className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none min-w-0" />

      {/* Search button */}
      <button className="flex items-center justify-center px-3 py-2 text-muted-foreground hover:text-emerald-400 transition-colors shrink-0">
        <Search className="h-4 w-4" />
      </button>
    </div>
  );
}

function SecondaryNavItem({ item, pathname }: { item: (typeof secondaryNav)[0]; pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className={cn('flex cursor-pointer items-center gap-1 px-4 py-2.5 text-sm font-medium transition-colors hover:text-foreground whitespace-nowrap', isActive ? 'text-emerald-400' : 'text-muted-foreground')}>
        {item.label}
        <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-52 rounded-md border border-border/60 bg-popover shadow-xl z-50 py-1">
          {item.sub.map((sub) => (
            <Link key={sub.href} href={sub.href} onClick={() => setOpen(false)} className={cn('block cursor-pointer px-4 py-2 text-sm transition-colors hover:bg-muted', pathname === sub.href ? 'text-emerald-400' : 'text-muted-foreground hover:text-foreground')}>
              {sub.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/40">
      {/* Primary bar */}
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-base font-bold tracking-tight text-foreground">
              Transfer<span className="text-emerald-500">Hub</span>
            </span>
          </Link>

          {/* Centered search */}
          <div className="flex-1 flex justify-center px-4">
            <SearchBar className="w-full max-w-xl" />
          </div>

          {/* Right: Login */}
          <div className="shrink-0 flex items-center gap-3">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white">
              Zaloguj się
            </Button>
            {/* Mobile toggle */}
            <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Secondary nav bar */}
      <div className="hidden md:block border-t border-border/30 bg-background/80">
        <div className="mx-auto max-w-7xl px-4">
          <nav className="flex w-full items-center justify-center gap-2 py-1">
            {secondaryNav.map((item) => (
              <SecondaryNavItem key={item.href} item={item} pathname={pathname} />
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-md">
          <nav className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-1">
            <div className="mb-2">
              <SearchBar />
            </div>
            {secondaryNav.map((item) => (
              <div key={item.href}>
                <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{item.label}</p>
                {item.sub.map((sub) => (
                  <Link key={sub.href} href={sub.href} onClick={() => setMobileOpen(false)} className="block cursor-pointer rounded-md px-5 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                    {sub.label}
                  </Link>
                ))}
              </div>
            ))}
            <div className="pt-2 border-t border-border/40 mt-1">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">Zaloguj się</Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
