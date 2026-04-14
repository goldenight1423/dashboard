'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { POSTURA_COLORS, POSTURA_LABELS } from '@/lib/constants';

interface Props {
  data: { postura: string; count: number; porcentaje: number }[];
}

export default function PosturaBarChart({ data }: Props) {
  const formatted = data.map(d => ({
    ...d,
    label: POSTURA_LABELS[d.postura] ?? d.postura,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={formatted} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" horizontal={false} />
        <XAxis type="number" tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis
          type="category" dataKey="label" width={190}
          tick={{ fill: '#D1D5DB', fontSize: 12 }} axisLine={false} tickLine={false}
        />
        <Tooltip
          contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: 8 }}
          labelStyle={{ color: '#F9FAFB', fontWeight: 600 }}
          formatter={(value, _, item) => [
            `${value} publicaciones (${(item.payload as { porcentaje: number }).porcentaje}%)`,
            '',
          ]}
        />
        <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={28}>
          {formatted.map((entry) => (
            <Cell key={entry.postura} fill={POSTURA_COLORS[entry.postura] ?? '#6B7280'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
