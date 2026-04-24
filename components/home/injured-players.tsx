import Link from "next/link"
import { ArrowRight, Activity } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const injured = [
  { id: "i1", name: "Trent Alexander-Arnold", pos: "RB", club: "Real Madrid", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", injury: "Mięsień", returnDate: "Marzec 2025", severity: "medium" },
  { id: "i2", name: "Rodri", pos: "DM", club: "Man City", flag: "🇪🇸", injury: "ACL", returnDate: "Kwiecień 2025", severity: "high" },
  { id: "i3", name: "Bukayo Saka", pos: "RW", club: "Arsenal", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", injury: "Ścięgno", returnDate: "Luty 2025", severity: "medium" },
  { id: "i4", name: "Marcin Bułka", pos: "GK", club: "Nice", flag: "🇵🇱", injury: "Bark", returnDate: "Styczeń 2025", severity: "low" },
]

const severityConfig = {
  low: { label: "Lekka", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  medium: { label: "Średnia", className: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  high: { label: "Ciężka", className: "bg-rose-500/15 text-rose-400 border-rose-500/20" },
}

export function InjuredPlayers() {
  return (
    <Card className="bg-card/50 border-border/40">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-rose-400" />
          Kontuzjowani zawodnicy
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 -mr-2" asChild>
          <Link href="/zawodnicy/kontuzjowani">
            Wszyscy <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/30">
          {injured.map((p) => (
            <Link
              key={p.id}
              href={`/zawodnik/${p.id}`}
              className="flex items-center gap-3 px-6 py-3 hover:bg-muted/30 transition-colors group"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-700 to-rose-900 text-white text-xs font-bold">
                {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-foreground group-hover:text-emerald-400 transition-colors truncate">
                    {p.flag} {p.name}
                  </span>
                  <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {p.pos}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">{p.club} &middot; {p.injury}</span>
                </div>
              </div>
              <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${severityConfig[p.severity as keyof typeof severityConfig].className}`}>
                  {severityConfig[p.severity as keyof typeof severityConfig].label}
                </Badge>
                <span className="text-xs text-muted-foreground">{p.returnDate}</span>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
