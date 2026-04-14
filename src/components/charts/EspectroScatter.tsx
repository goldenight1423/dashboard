'use client';

import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Label,
} from 'recharts';
import { POSTURA_COLORS, POSTURA_LABELS, IMAGINARIO_LABELS } from '@/lib/constants';

interface CEO {
  persona_id: string;
  nombre: string;
  empresa: string;
  postura_predominante: string;
  imaginario_predominante: string;
  avg_peso_trans: number;
  avg_confianza: number;
  total_publicaciones: number;
}

interface Props { data: CEO[] }

const CustomDot = (props: {
  cx?: number; cy?: number; payload?: CEO;
}) => {
  const { cx = 0, cy = 0, payload } = props;
  if (!payload) return null;
  const r = Math.max(14, Math.min(30, Math.sqrt(payload.total_publicaciones) * 4));
  const color = POSTURA_COLORS[payload.postura_predominante] ?? '#6B7280';
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={color} fillOpacity={0.8} stroke="#030712" strokeWidth={2} />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
        style={{ fontSize: 9, fill: '#fff', fontWeight: 700, pointerEvents: 'none' }}>
        {payload.nombre.split(' ')[0]}
      </text>
    </g>
  );
};

export default function EspectroScatter({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={340}>
      <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
        <XAxis
          type="number" dataKey="avg_peso_trans" domain={[0, 1]}
          tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false}
          tickFormatter={(v) => `${Math.round(v * 100)}%`}
        >
          <Label value="← Posthumanista ·········· Transhumanista →"
            position="bottom" offset={20} style={{ fill: '#6B7280', fontSize: 12 }} />
        </XAxis>
        <YAxis
          type="number" dataKey="avg_confianza" domain={[0.5, 1]}
          tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false}
          tickFormatter={(v) => `${Math.round(v * 100)}%`}
          width={42}
        >
          <Label value="Confianza" angle={-90} position="insideLeft"
            style={{ fill: '#6B7280', fontSize: 12 }} />
        </YAxis>
        <Tooltip
          cursor={{ strokeDasharray: '3 3', stroke: '#374151' }}
          contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: 8 }}
          content={({ payload }) => {
            if (!payload?.length) return null;
            const d = payload[0]?.payload as CEO;
            return (
              <div className="p-3 text-sm">
                <p className="font-bold text-white">{d.nombre}</p>
                <p className="text-gray-400">{d.empresa}</p>
                <p className="mt-1 text-gray-300">
                  Postura: <span style={{ color: POSTURA_COLORS[d.postura_predominante] }}>
                    {POSTURA_LABELS[d.postura_predominante]}
                  </span>
                </p>
                <p className="text-gray-300">
                  Imaginario: {IMAGINARIO_LABELS[d.imaginario_predominante]}
                </p>
                <p className="text-gray-300">
                  Peso trans: {Math.round(d.avg_peso_trans * 100)}%
                </p>
                <p className="text-gray-300">
                  Confianza: {Math.round(d.avg_confianza * 100)}%
                </p>
                <p className="text-gray-300">
                  Publicaciones: {d.total_publicaciones}
                </p>
              </div>
            );
          }}
        />
        <Scatter data={data} shape={<CustomDot />} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
