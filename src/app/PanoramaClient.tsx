'use client';

import { useEffect, useState } from 'react';
import PosturaBarChart from '@/components/charts/PosturaBarChart';
import ImaginarioDonut from '@/components/charts/ImaginarioDonut';
import { POSTURA_COLORS, POSTURA_LABELS, IMAGINARIO_LABELS, PLATAFORMA_LABELS, SENTIMIENTO_LABELS } from '@/lib/constants';
import { formatDate, formatNumber, getSentimientoColor, getImaginarioColor, getPosturaColor } from '@/lib/utils';

interface PanoramaData {
  metricas: {
    totalCeos: number;
    totalPublicaciones: number;
    totalAnalizadas: number;
    sentimientoAvg: number;
    imaginarioDominante: string;
    imaginarioDominantePct: number;
  };
  posturas: { postura: string; count: number; porcentaje: number }[];
  imaginarios: { imaginario: string; count: number; porcentaje: number }[];
  ultimasPublicaciones: {
    id: string; titulo: string; plataforma: string; fecha_publicacion: string;
    nombre: string; empresa: string;
    postura_general: string; imaginario_dominante: string;
    sentimiento: string; confianza_clasificacion: number;
  }[];
}

function MetricCard({ label, value, sub, color }: {
  label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold" style={{ color: color ?? '#F9FAFB' }}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
      {label}
    </span>
  );
}

export default function PanoramaClient() {
  const [data, setData] = useState<PanoramaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/panorama')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError('Error al cargar datos'); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-gray-500">Cargando datos...</div>
    </div>
  );

  if (error || !data) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-red-400">{error || 'Sin datos'}</div>
    </div>
  );

  const { metricas, posturas, imaginarios, ultimasPublicaciones } = data;
  const sentPct = Math.round(metricas.sentimientoAvg * 100);
  const sentColor = sentPct >= 70 ? '#4ADE80' : sentPct >= 50 ? '#FCD34D' : '#F87171';

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Panorama General</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Visión global del análisis discursivo de CEOs sobre IA
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="CEOs monitoreados" value={metricas.totalCeos} sub="Activos" />
        <MetricCard
          label="Publicaciones analizadas"
          value={metricas.totalAnalizadas}
          sub={`de ${metricas.totalPublicaciones} totales`}
        />
        <MetricCard
          label="Sentimiento promedio"
          value={`${sentPct}%`}
          sub="Escala 0–100 (positivo)"
          color={sentColor}
        />
        <MetricCard
          label="Imaginario dominante"
          value={IMAGINARIO_LABELS[metricas.imaginarioDominante] ?? metricas.imaginarioDominante}
          sub={`${metricas.imaginarioDominantePct}% del corpus`}
          color={getImaginarioColor(metricas.imaginarioDominante)}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">
            Distribución de posturas discursivas
          </h2>
          <PosturaBarChart data={posturas} />
          <div className="mt-3 flex flex-wrap gap-2">
            {posturas.map(p => (
              <div key={p.postura} className="flex items-center gap-1.5 text-xs text-gray-400">
                <div className="w-2.5 h-2.5 rounded-full"
                  style={{ background: POSTURA_COLORS[p.postura] }} />
                {POSTURA_LABELS[p.postura]} ({p.porcentaje}%)
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">
            Imaginario trans vs posthumanista
          </h2>
          <ImaginarioDonut data={imaginarios} />
        </div>
      </div>

      {/* Tabla últimas publicaciones */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-300">
            Últimas publicaciones analizadas
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['CEO / Empresa', 'Plataforma', 'Publicación', 'Postura', 'Imaginario', 'Sentimiento', 'Fecha'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {ultimasPublicaciones.map(pub => (
                <tr key={pub.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-200">{pub.nombre}</p>
                    <p className="text-xs text-gray-500">{pub.empresa}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {PLATAFORMA_LABELS[pub.plataforma] ?? pub.plataforma}
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <p className="text-gray-300 truncate">{pub.titulo ?? '—'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      label={POSTURA_LABELS[pub.postura_general] ?? pub.postura_general}
                      color={getPosturaColor(pub.postura_general)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      label={IMAGINARIO_LABELS[pub.imaginario_dominante] ?? pub.imaginario_dominante}
                      color={getImaginarioColor(pub.imaginario_dominante)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      label={SENTIMIENTO_LABELS[pub.sentimiento] ?? pub.sentimiento}
                      color={getSentimientoColor(pub.sentimiento)}
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {formatDate(pub.fecha_publicacion)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
