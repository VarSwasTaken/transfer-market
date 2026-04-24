'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const data = [
  { year: '2019', value: 320 },
  { year: '2020', value: 355 },
  { year: '2021', value: 402 },
  { year: '2022', value: 468 },
  { year: '2023', value: 515 },
  { year: '2024', value: 562 },
  { year: '2025', value: 608 },
];

export function SquadValueChart() {
  return (
    <Card className="border-border/40 bg-card/50">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold">Historia wartości składu</CardTitle>
            <CardDescription className="mt-1 text-xs">Wartość w milionach EUR</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-emerald-400">608 mln €</p>
            <p className="mt-0.5 text-xs text-emerald-400">+8.2% vs zeszły rok</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#ffffff' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#ffffff' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}M`} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'hsl(var(--foreground))',
              }}
              formatter={(v) => {
                const numericValue = typeof v === 'number' ? v : Number(v ?? 0);
                return [`${numericValue} mln`, 'Wartość składu'];
              }}
            />
            <ReferenceLine y={560} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#10b981' }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
