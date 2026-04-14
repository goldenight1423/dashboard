'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { IMAGINARIO_COLORS, IMAGINARIO_LABELS } from '@/lib/constants';

interface Props {
  data: { imaginario: string; count: number; porcentaje: number }[];
}

export default function ImaginarioDonut({ data }: Props) {
  const formatted = data.map(d => ({
    ...d,
    name: IMAGINARIO_LABELS[d.imaginario] ?? d.imaginario,
    color: IMAGINARIO_COLORS[d.imaginario] ?? '#6B7280',
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={formatted}
          cx="50%"
          cy="48%"
          innerRadius={72}
          outerRadius={100}
          paddingAngle={3}
          dataKey="count"
        >
          {formatted.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: 8 }}
          formatter={(value, _, item) => [
            `${value} (${(item.payload as { porcentaje: number }).porcentaje}%)`, ''
          ]}
        />
        <Legend
          iconType="circle"
          formatter={(value) => <span style={{ color: '#D1D5DB', fontSize: 12 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
