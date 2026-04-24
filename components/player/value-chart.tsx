'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const data = [
  { year: '2019', value: 3 },
  { year: '2020', value: 8 },
  { year: '2021', value: 18 },
  { year: '2022', value: 35 },
  { year: '2023', value: 52 },
  { year: '2024', value: 70 },
  { year: '2025', value: 87 },
];

export function ValueChart() {
  return (
    <Card className="bg-card/50 border-border/40">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Historia wyceny rynkowej</CardTitle>
            <CardDescription className="text-xs mt-1">Wartość w milionach EUR</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-emerald-400">87 mln €</p>
            <p className="text-xs text-emerald-400 mt-0.5">+24.3% vs zeszły rok</p>
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
                return [`${numericValue} mln`, 'Wycena'];
              }}
            />
            <ReferenceLine y={70} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#10b981' }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
