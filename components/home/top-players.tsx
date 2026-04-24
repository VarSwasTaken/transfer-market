import Link from "next/link"
import { ArrowRight, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

const players = [
  { id: "1", name: "Kylian Mbappé", club: "Real Madrid", flag: "🇫🇷", pos: "ST", age: 25, value: "€ 180 mln", rating: 95, valueNum: 180 },
  { id: "2", name: "Erling Haaland", club: "Man City", flag: "🇳🇴", pos: "ST", age: 23, value: "€ 170 mln", rating: 94, valueNum: 170 },
  { id: "3", name: "Vinicius Jr.", club: "Real Madrid", flag: "🇧🇷", pos: "LW", age: 23, value: "€ 150 mln", rating: 93, valueNum: 150 },
  { id: "4", name: "Jude Bellingham", club: "Real Madrid", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", pos: "CM", age: 20, value: "€ 150 mln", rating: 92, valueNum: 150 },
  { id: "5", name: "Pedri", club: "Barcelona", flag: "🇪🇸", pos: "CM", age: 21, value: "€ 140 mln", rating: 91, valueNum: 140 },
]

const MAX = 180

export function TopPlayers() {
  return (
    <Card className="bg-card/50 border-border/40">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
          Top wyceniani piłkarze
        </CardTitle>
        <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 -mr-2" asChild>
          <Link href="/zawodnicy/wyceny">
            Więcej <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {players.map((p, i) => (
          <Link key={p.id} href={`/zawodnik/${p.id}`} className="group flex items-center gap-3">
            <span className="w-5 text-xs font-bold text-muted-foreground text-right shrink-0">{i + 1}</span>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 text-white text-xs font-bold">
              {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-foreground group-hover:text-emerald-400 transition-colors truncate">
                  {p.flag} {p.name}
                </span>
                <span className="shrink-0 text-[10px] font-bold px-1 py-0.5 rounded bg-muted text-muted-foreground">
                  {p.pos}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Progress value={(p.valueNum / MAX) * 100} className="h-1 flex-1 bg-muted [&>div]:bg-emerald-500" />
                <span className="shrink-0 text-xs font-semibold text-emerald-400">{p.value}</span>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
