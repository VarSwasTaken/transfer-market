import Link from "next/link"
import { ArrowRight, CalendarDays } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const windows = [
  {
    id: "w1",
    name: "Zimowe okienko 2025",
    period: "1 sty – 31 sty 2025",
    status: "active",
    transfers: 312,
    totalValue: "€ 1.8 mld",
    href: "/transfery/okienka",
  },
  {
    id: "w2",
    name: "Letnie okienko 2024",
    period: "1 cze – 31 sie 2024",
    status: "closed",
    transfers: 1840,
    totalValue: "€ 7.2 mld",
    href: "/transfery/okienka",
  },
  {
    id: "w3",
    name: "Zimowe okienko 2024",
    period: "1 sty – 31 sty 2024",
    status: "closed",
    transfers: 289,
    totalValue: "€ 1.4 mld",
    href: "/transfery/okienka",
  },
]

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: "Aktywne", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  closed: { label: "Zakończone", className: "bg-muted text-muted-foreground border-border/40" },
  upcoming: { label: "Nadchodzące", className: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
}

export function TransferWindows() {
  return (
    <Card className="bg-card/50 border-border/40">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          Okienka transferowe
        </CardTitle>
        <Link
          href="/transfery/okienka"
          className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
        >
          Wszystkie <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {windows.map((w) => (
          <Link
            key={w.id}
            href={w.href}
            className="flex items-center justify-between rounded-lg border border-border/40 bg-background/40 px-4 py-3 hover:bg-muted/30 transition-colors group"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-foreground group-hover:text-emerald-400 transition-colors">
                  {w.name}
                </span>
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${statusConfig[w.status].className}`}>
                  {statusConfig[w.status].label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{w.period}</p>
            </div>
            <div className="text-right shrink-0 ml-4">
              <p className="text-sm font-semibold text-emerald-400">{w.totalValue}</p>
              <p className="text-xs text-muted-foreground">{w.transfers} transferów</p>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
