'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Search, Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const secondaryNav = [
  {
    label: 'Transfery',
    href: '/transfers',
    sub: [
      { label: 'Transfery definitywne', href: '/transfers' },
      { label: 'Plotki transferowe', href: '/transfers/rumours' },
    ],
  },
  {
    label: 'Rankingi',
    href: '/rankings',
    sub: [
      { label: 'Najdrożsi zawodnicy', href: '/rankings/most-expensive-players' },
      { label: 'Najdroższe kluby', href: '/rankings/most-expensive-clubs' },
    ],
  },
  {
    label: 'Ligi',
    href: '/leagues',
    sub: [
      { label: 'Premier League', href: '/leagues/premier-league' },
      { label: 'La Liga', href: '/leagues/la-liga' },
      { label: 'Bundesliga', href: '/leagues/bundesliga' },
      { label: 'Serie A', href: '/leagues/serie-a' },
      { label: 'Ligue 1', href: '/leagues/ligue-1' },
      { label: 'Ekstraklasa', href: '/leagues/ekstraklasa' },
      { label: 'Więcej lig...', href: '/leagues' },
    ],
  },
  {
    label: 'Zawodnicy',
    href: '/players',
    sub: [{ label: 'Przeglądaj zawodników', href: '/players' }],
  },
];

const searchScopes = [
  { label: 'Wszystko', value: 'all' },
  { label: 'Zawodnicy', value: 'zawodnicy' },
  { label: 'Kluby', value: 'kluby' },
  { label: 'Ligi', value: 'ligi' },
];

function SearchBar({ className }: { className?: string }) {
  const [scope, setScope] = useState(searchScopes[0]);
  const [scopeOpen, setScopeOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<number | null>(null);
  useRouter();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setScopeOpen(false);
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    // hide results when scope selector opens
    if (scopeOpen) setOpen(false);
    // debounce search
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (!query || query.trim().length < 2) {
      setResults(null);
      setOpen(false);
      setLoading(false);
      return;
    }

    debounceRef.current = window.setTimeout(async () => {
      // cancel previous
      if (abortRef.current) abortRef.current.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      try {
        const typeMap: Record<string, string> = {
          all: 'all',
          zawodnicy: 'players',
          kluby: 'clubs',
          ligi: 'leagues',
        };
        const type = typeMap[scope.value] || 'all';
        const params = new URLSearchParams({ query: query.trim(), type, limit: '5' });
        const res = await fetch(`/api/v1/search?${params.toString()}`, { signal: ctrl.signal });
        if (!res.ok) throw new Error('Search failed');
        const json = await res.json();
        setResults(json.data);
        const hasAny = (json.data.players?.length || 0) + (json.data.clubs?.length || 0) + (json.data.leagues?.length || 0) + (json.data.agents?.length || 0) > 0;
        setOpen(hasAny);
      } catch (err) {
        if ((err as any).name !== 'AbortError') {
          console.error('Search error', err);
        }
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query, scope]);

  function mapLabelForPlaceholder() {
    return `Szukaj ${scope.value === 'all' ? 'zawodników, klubów, lig...' : `${scope.label.toLowerCase()}...`}`;
  }

  return (
    <div ref={dropRef} className={cn('relative flex items-center rounded-lg border border-border/60 bg-muted/40 overflow-visible focus-within:ring-2 focus-within:ring-emerald-500/40 focus-within:border-emerald-500/40 transition-all', className)}>
      {/* Scope selector */}
      <div className="relative shrink-0">
        <button
          onClick={() => {
            setScopeOpen(!scopeOpen);
            setOpen(false);
          }}
          className="flex cursor-pointer items-center gap-1 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground border-r border-border/60 whitespace-nowrap transition-colors"
        >
          {scope.label}
          <ChevronDown className="h-3 w-3" />
        </button>
        {scopeOpen && (
          <div className="absolute top-full left-0 z-9999 mt-1 w-36 rounded-md border border-border/60 bg-popover py-1 shadow-lg">
            {searchScopes.map((s) => (
              <button
                key={s.value}
                onClick={() => {
                  setScope(s);
                  setScopeOpen(false);
                  setOpen(false);
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
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={mapLabelForPlaceholder()}
        className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none min-w-0"
        onFocus={() => {
          if (results) setOpen(true);
        }}
      />

      {/* Search button */}
      <button
        className="flex items-center justify-center px-3 py-2 text-muted-foreground hover:text-emerald-400 transition-colors shrink-0"
        onClick={() => {
          if (query.trim().length >= 2) setQuery((q) => q);
        }}
      >
        <Search className="h-4 w-4" />
      </button>

      {/* Results dropdown */}
      {open && results && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 w-full max-w-xl mx-auto rounded-md border border-border/60 bg-popover shadow-lg">
          <div className="p-2">
            {/* Players */}
            {results.players && results.players.length > 0 && (
              <div className="mb-2">
                <p className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">Zawodnicy</p>
                <div>
                  {results.players.map((p: any) => (
                    <div
                      key={`p-${p.id}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setOpen(false);
                        window.location.href = `/players/${p.id}`;
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setOpen(false);
                          window.location.href = `/players/${p.id}`;
                        }
                      }}
                      className="block px-2 py-1 text-sm hover:bg-muted rounded cursor-pointer"
                    >
                      {p.firstName} {p.lastName}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Clubs */}
            {results.clubs && results.clubs.length > 0 && (
              <div className="mb-2">
                <p className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">Kluby</p>
                <div>
                  {results.clubs.map((c: any) => (
                    <div
                      key={`c-${c.id}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setOpen(false);
                        window.location.href = `/clubs/${c.id}`;
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setOpen(false);
                          window.location.href = `/clubs/${c.id}`;
                        }
                      }}
                      className="block px-2 py-1 text-sm hover:bg-muted rounded cursor-pointer"
                    >
                      {c.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Leagues */}
            {results.leagues && results.leagues.length > 0 && (
              <div className="mb-2">
                <p className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">Ligi</p>
                <div>
                  {results.leagues.map((l: any) => (
                    <div
                      key={`l-${l.id}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setOpen(false);
                        window.location.href = `/leagues/${l.slug}`;
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setOpen(false);
                          window.location.href = `/leagues/${l.slug}`;
                        }
                      }}
                      className="block px-2 py-1 text-sm hover:bg-muted rounded cursor-pointer"
                    >
                      {l.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Agents */}
            {results.agents && results.agents.length > 0 && (
              <div className="mb-0">
                <p className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">Agenci</p>
                <div>
                  {results.agents.map((a: any) => (
                    <div
                      key={`a-${a.id}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setOpen(false);
                        window.location.href = `/agent/${a.id}`;
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setOpen(false);
                          window.location.href = `/agent/${a.id}`;
                        }
                      }}
                      className="block px-2 py-1 text-sm hover:bg-muted rounded cursor-pointer"
                    >
                      {a.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
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
              <Link href="/admin" onClick={() => setMobileOpen(false)} className="block w-full text-center rounded-md bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors">
                Panel Admina
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
