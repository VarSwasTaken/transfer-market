import Link from "next/link"
import { ArrowRight, Flame } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const rumours = [
  {
    id: "r1",
    player: "Lamine Yamal",
    position: "RW",
    age: 17,
    from: "Barcelona",
    fromFlag: "🇪🇸",
    to: "PSG",
    toFlag: "🇫🇷",
    reliability: 90,
    fee: "€ 220 mln",
    date: "dziś",
  },
  {
    id: "r2",
    player: "Florian Wirtz",
    position: "AM",
    age: 21,
    from: "B. Leverkusen",
    fromFlag: "🇩🇪",
    to: "Man City",
    toFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    reliability: 75,
    fee: "€ 130 mln",
    date: "wczoraj",
  },
  {
    id: "r3",
    player: "Szymon Żurkowski",
    position: "CM",
    age: 27,
    from: "Empoli",
    fromFlag: "🇮🇹",
    to: "Legia Warszawa",
    toFlag: "🇵🇱",
    reliability: 60,
    fee: "€ 2.5 mln",
    date: "2 dni temu",
  },
  {
    id: "r4",
    player: "Viktor Gyökeres",
    position: "ST",
    age: 26,
    from: "Sporting CP",
    fromFlag: "🇵🇹",
    to: "Arsenal",
    toFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    reliability: 85,
    fee: "€ 100 mln",
    date: "3 dni temu",
  },
]

function ReliabilityBar({ value }: { value: number }) {
  const color =
    value >= 80 ? "bg-emerald-500" : value >= 60 ? "bg-amber-500" : "bg-rose-500"
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[10px] text-muted-foreground">{value}%</span>
    </div>
  )
}

export function HotRumours() {
  return (
    <Card className="bg-card/50 border-border/40">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-400" />
          Gorące plotki
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 -mr-2" asChild>
          <Link href="/transfery/plotki">
            Wszystkie <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/30">
          {rumours.map((r) => (
            <Link
              key={r.id}
              href={`/zawodnik/${r.id}`}
              className="flex items-center gap-3 px-6 py-3.5 hover:bg-muted/30 transition-colors group"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-600 to-orange-800 text-white text-xs font-bold">
                {r.player.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground group-hover:text-emerald-400 transition-colors truncate">
                    {r.player}
                  </span>
                  <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {r.position}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                  <span>{r.fromFlag} {r.from}</span>
                  <ArrowRight className="h-3 w-3 shrink-0" />
                  <span>{r.toFlag} {r.to}</span>
                </div>
                <ReliabilityBar value={r.reliability} />
              </div>
              <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                <span className="text-sm font-semibold text-foreground">{r.fee}</span>
                <span className="text-xs text-muted-foreground">{r.date}</span>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
