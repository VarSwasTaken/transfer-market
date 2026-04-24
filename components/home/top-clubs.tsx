import Link from "next/link"
import { ArrowRight, Building2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

const clubs = [
  { id: "c1", name: "Real Madrid", flag: "🇪🇸", league: "La Liga", value: "€ 1.48 mld", valueNum: 1480 },
  { id: "c2", name: "Manchester City", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", league: "Premier League", value: "€ 1.35 mld", valueNum: 1350 },
  { id: "c3", name: "Liverpool FC", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", league: "Premier League", value: "€ 1.22 mld", valueNum: 1220 },
  { id: "c4", name: "FC Barcelona", flag: "🇪🇸", league: "La Liga", value: "€ 1.18 mld", valueNum: 1180 },
  { id: "c5", name: "Bayern München", flag: "🇩🇪", league: "Bundesliga", value: "€ 1.12 mld", valueNum: 1120 },
]

const MAX = 1480

export function TopClubs() {
  return (
    <Card className="bg-card/50 border-border/40">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Building2 className="h-4 w-4 text-sky-400" />
          Top wyceniane kluby
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 -mr-2" asChild>
          <Link href="/rankingi/wyceny-kluby">
            Więcej <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {clubs.map((c, i) => (
          <Link key={c.id} href={`/klub/${c.id}`} className="group flex items-center gap-3">
            <span className="w-5 text-xs font-bold text-muted-foreground text-right shrink-0">{i + 1}</span>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-600 to-sky-900 text-white text-xs font-bold">
              {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-foreground group-hover:text-emerald-400 transition-colors truncate">
                  {c.flag} {c.name}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Progress value={(c.valueNum / MAX) * 100} className="h-1 flex-1 bg-muted [&>div]:bg-sky-500" />
                <span className="shrink-0 text-xs font-semibold text-sky-400">{c.value}</span>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
