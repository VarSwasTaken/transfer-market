import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HottestRumour() {
  return (
    <div className="rounded-xl overflow-hidden border border-orange-500/20 bg-gradient-to-r from-orange-950/60 to-card/60 relative">
      <div className="absolute inset-0 opacity-10">
        <Image src="/images/transfer-bg.jpg" alt="" fill className="object-cover object-center" />
      </div>
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white font-bold text-sm shrink-0">
            LY
          </div>
          <div>
            <p className="text-xs text-orange-400 font-medium uppercase tracking-wider flex items-center gap-1">
              <Flame className="h-3 w-3" />
              Najgorętsza plotka transferowa
            </p>
            <p className="font-bold text-foreground">Lamine Yamal &rarr; PSG</p>
            <p className="text-sm text-muted-foreground">FC Barcelona &middot; RW &middot; 17 lat &middot; wiarygodnosc: 90%</p>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <p className="text-2xl font-bold text-orange-400">€ 220 mln</p>
            <p className="text-xs text-muted-foreground">szacowana kwota</p>
          </div>
          <Button variant="outline" size="sm" className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10" asChild>
            <Link href="/zawodnik/lamine-yamal">
              Profil <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
