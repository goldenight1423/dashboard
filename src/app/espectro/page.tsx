'use client';

import { useEffect, useState } from 'react';
import EspectroScatter from '@/components/charts/EspectroScatter';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { POSTURA_LABELS, POSTURA_COLORS, IMAGINARIO_LABELS, IMAGINARIO_COLORS } from '@/lib/constants';

interface CEO {
  persona_id: string; nombre: string; empresa: string; sector: string;
  postura_predominante: string; imaginario_predominante: string;
  avg_peso_trans: number; avg_confianza: number; total_publicaciones: number;
}
interface Bucket { bucket: number; count: number; label: string }

export default function EspectroPage() {
  const [ceos, setCeos] = useState<CEO[]>([]);
  const [hist, setHist] = useState<Bucket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/espectro')
      .then(r => r.json())
      .then(d => { setCeos(d.ceos); setHist(d.histograma); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-gray-500">Cargando espectro...</p>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Espectro Discursivo</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Posición de cada CEO en el espectro transhumanista ↔ posthumanista
        </p>
      </div>

      {/* Scatter */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-1">
          Mapa del espectro (eje X = peso transhumanista promedio, tamaño = nº de publicaciones)
        </h2>
        <p className="text-xs text-gray-600 mb-4">Hover sobre cada punto para ver el detalle del CEO</p>
        <EspectroScatter data={ceos} />

        {/* Leyenda posturas */}
        <div className="mt-4 flex flex-wrap gap-3">
          {Object.entries(POSTURA_LABELS).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5 text-xs text-gray-400">
              <div className="w-3 h-3 rounded-full" style={{ background: POSTURA_COLORS[k] }} />
              {v}
            </div>
          ))}
        </div>
      </div>

      {/* Histograma + tabla CEOs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">
            Distribución del peso transhumanista (todas las publicaciones)
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hist} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
              <XAxis dataKey="label" tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} />
              <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} width={32} />
              <Tooltip
                contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: 8 }}
                formatter={(v) => [`${v} publicaciones`, '']}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={36}>
                {hist.map((h) => {
                  const hue = Math.round(h.bucket * 100);
                  const color = hue >= 50 ? '#EF4444' : '#10B981';
                  return <Cell key={h.bucket} fill={color} fillOpacity={0.6 + h.bucket * 0.4} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-600 mt-2 text-center">
            Verde = posthumanista · Rojo = transhumanista
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Ranking por peso transhumanista</h2>
          <div className="space-y-3">
            {ceos.map((ceo) => (
              <div key={ceo.persona_id}>
                <div className="flex justify-between items-center mb-1">
                  <div>
                    <span className="text-sm text-gray-200 font-medium">{ceo.nombre}</span>
                    <span className="text-xs text-gray-500 ml-2">{ceo.empresa}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs"
                      style={{ color: IMAGINARIO_COLORS[ceo.imaginario_predominante] }}>
                      {IMAGINARIO_LABELS[ceo.imaginario_predominante]}
                    </span>
                    <span className="text-sm font-bold text-gray-300">
                      {Math.round(ceo.avg_peso_trans * 100)}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.round(ceo.avg_peso_trans * 100)}%`,
                      background: `linear-gradient(to right, #10B981, #EF4444)`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
