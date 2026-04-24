import Link from "next/link"
import { ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Transfer = {
  id: string
  player: string
  position: string
  age: number
  from: string
  fromCountry: string
  to: string
  toCountry: string
  fee: string
  type: "transfer" | "wypozyczenie" | "wolny-agent"
  date: string
  trend: "up" | "down" | "neutral"
}

const transfers: Transfer[] = [
  {
    id: "1",
    player: "Marcelo Ferreira",
    position: "LW",
    age: 23,
    from: "Sporting CP",
    fromCountry: "🇵🇹",
    to: "Manchester City",
    toCountry: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    fee: "€ 87 mln",
    type: "transfer",
    date: "dziś",
    trend: "up",
  },
  {
    id: "2",
    player: "Jonas Becker",
    position: "CM",
    age: 26,
    from: "Bayern München",
    fromCountry: "🇩🇪",
    to: "Real Madrid",
    toCountry: "🇪🇸",
    fee: "€ 65 mln",
    type: "transfer",
    date: "wczoraj",
    trend: "up",
  },
  {
    id: "3",
    player: "Tomasz Wiśniewski",
    position: "CB",
    age: 28,
    from: "Lech Poznań",
    fromCountry: "🇵🇱",
    to: "Feyenoord",
    toCountry: "🇳🇱",
    fee: "€ 4.2 mln",
    type: "transfer",
    date: "2 dni temu",
    trend: "neutral",
  },
  {
    id: "4",
    player: "Alejandro Vidal",
    position: "ST",
    age: 31,
    from: "Atletico Madrid",
    fromCountry: "🇪🇸",
    to: "Al-Nassr",
    toCountry: "🇸🇦",
    fee: "€ 22 mln",
    type: "transfer",
    date: "3 dni temu",
    trend: "down",
  },
  {
    id: "5",
    player: "Kwame Asante",
    position: "RB",
    age: 22,
    from: "Ajax",
    fromCountry: "🇳🇱",
    to: "Arsenal",
    toCountry: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    fee: "Wypożyczenie",
    type: "wypozyczenie",
    date: "4 dni temu",
    trend: "neutral",
  },
]

const typeConfig = {
  transfer: { label: "Transfer", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  wypozyczenie: { label: "Wypożyczenie", className: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  "wolny-agent": { label: "Wolny agent", className: "bg-sky-500/15 text-sky-400 border-sky-500/20" },
}

const TrendIcon = ({ trend }: { trend: Transfer["trend"] }) => {
  if (trend === "up") return <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
  if (trend === "down") return <TrendingDown className="h-3.5 w-3.5 text-rose-400" />
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />
}

export function RecentTransfers() {
  return (
    <Card className="bg-card/50 border-border/40">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base font-semibold">Ostatnie transfery</CardTitle>
        <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 -mr-2" asChild>
          <Link href="/transfery">
            Wszystkie <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/30">
          {transfers.map((t) => (
            <Link
              key={t.id}
              href={`/zawodnik/${t.id}`}
              className="flex items-center gap-3 px-6 py-3.5 transition-colors hover:bg-muted/30 group"
            >
              {/* Player initials */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-white text-xs font-bold">
                {t.player.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>

              {/* Player info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground group-hover:text-emerald-400 transition-colors truncate">
                    {t.player}
                  </span>
                  <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {t.position}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">{t.age} l.</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                  <span>{t.fromCountry} {t.from}</span>
                  <ArrowRight className="h-3 w-3 shrink-0" />
                  <span>{t.toCountry} {t.to}</span>
                </div>
              </div>

              {/* Fee + type */}
              <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                <div className="flex items-center gap-1">
                  <TrendIcon trend={t.trend} />
                  <span className="text-sm font-semibold text-foreground">{t.fee}</span>
                </div>
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${typeConfig[t.type].className}`}>
                  {typeConfig[t.type].label}
                </Badge>
              </div>

              {/* Date */}
              <div className="hidden md:block text-xs text-muted-foreground shrink-0 w-20 text-right">
                {t.date}
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
