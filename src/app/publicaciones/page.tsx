'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  POSTURA_LABELS, POSTURA_COLORS, IMAGINARIO_LABELS,
  IMAGINARIO_COLORS, PLATAFORMA_LABELS, SENTIMIENTO_LABELS,
} from '@/lib/constants';
import { formatDate, getSentimientoColor, formatNumber } from '@/lib/utils';

interface Pub {
  id: string; titulo: string; plataforma: string; tipo_contenido: string;
  fecha_publicacion: string; contenido_limpio: string;
  nombre: string; empresa: string;
  postura_general: string; imaginario_dominante: string;
  sentimiento: string; confianza_clasificacion: number;
  likes: number; shares: number; engagement_rate: number;
}

interface Pagination { total: number; page: number; limit: number; pages: number }

const POSTURAS = ['', ...Object.keys(POSTURA_LABELS)];
const IMAGINARIOS = ['', ...Object.keys(IMAGINARIO_LABELS)];

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
      {label}
    </span>
  );
}

export default function PublicacionesPage() {
  const [pubs, setPubs] = useState<Pub[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [postura, setPostura] = useState('');
  const [imaginario, setImaginario] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (postura) params.set('postura', postura);
    if (imaginario) params.set('imaginario', imaginario);
    fetch(`/api/publicaciones?${params}`)
      .then(r => r.json())
      .then(d => { setPubs(d.data); setPagination(d.pagination); setLoading(false); });
  }, [page, postura, imaginario]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white text-balance">Publicaciones</h1>
        <p className="text-sm text-gray-500 mt-0.5" aria-live="polite">
          {pagination ? `${pagination.total} publicaciones analizadas` : 'Cargando…'}
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-end" role="search" aria-label="Filtrar publicaciones">
        <div>
          <label htmlFor="filter-postura" className="block text-xs text-gray-500 mb-1">Postura</label>
          <select
            id="filter-postura"
            name="postura"
            value={postura}
            onChange={e => { setPostura(e.target.value); setPage(1); }}
            className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:border-violet-500"
          >
            {POSTURAS.map(p => (
              <option key={p} value={p}>
                {p ? POSTURA_LABELS[p] : 'Todas las posturas'}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filter-imaginario" className="block text-xs text-gray-500 mb-1">Imaginario</label>
          <select
            id="filter-imaginario"
            name="imaginario"
            value={imaginario}
            onChange={e => { setImaginario(e.target.value); setPage(1); }}
            className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:border-violet-500"
          >
            {IMAGINARIOS.map(i => (
              <option key={i} value={i}>
                {i ? IMAGINARIO_LABELS[i] : 'Todos los imaginarios'}
              </option>
            ))}
          </select>
        </div>
        {(postura || imaginario) && (
          <button
            onClick={() => { setPostura(''); setImaginario(''); setPage(1); }}
            className="text-xs text-gray-500 hover:text-gray-300 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Tabla de publicaciones">
            <thead>
              <tr className="border-b border-gray-800">
                {['CEO', 'Plataforma', 'Publicación', 'Postura', 'Imaginario', 'Sentimiento', 'Conf.', 'Likes', 'Fecha'].map(h => (
                  <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800" aria-live="polite" aria-busy={loading}>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-600" role="status">
                    Cargando…
                  </td>
                </tr>
              ) : pubs.map(pub => (
                <tr key={pub.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-200 whitespace-nowrap">{pub.nombre}</p>
                    <p className="text-xs text-gray-500">{pub.empresa}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {PLATAFORMA_LABELS[pub.plataforma] ?? pub.plataforma}
                  </td>
                  <td className="px-4 py-3 max-w-[220px]">
                    <p className="text-gray-300 truncate text-xs font-medium">{pub.titulo ?? '—'}</p>
                    <p className="text-gray-600 truncate text-xs mt-0.5">{pub.contenido_limpio}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      label={POSTURA_LABELS[pub.postura_general] ?? pub.postura_general}
                      color={POSTURA_COLORS[pub.postura_general] ?? '#6B7280'}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      label={IMAGINARIO_LABELS[pub.imaginario_dominante] ?? pub.imaginario_dominante}
                      color={IMAGINARIO_COLORS[pub.imaginario_dominante] ?? '#6B7280'}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      label={SENTIMIENTO_LABELS[pub.sentimiento] ?? pub.sentimiento}
                      color={getSentimientoColor(pub.sentimiento)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs tabular-nums ${
                      (pub.confianza_clasificacion ?? 0) >= 0.8 ? 'text-green-400'
                      : (pub.confianza_clasificacion ?? 0) >= 0.6 ? 'text-yellow-400'
                      : 'text-red-400'
                    }`}>
                      {pub.confianza_clasificacion ? `${Math.round(pub.confianza_clasificacion * 100)}%` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs tabular-nums whitespace-nowrap">
                    {formatNumber(pub.likes)}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {formatDate(pub.fecha_publicacion)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {pagination && pagination.pages > 1 && (
          <nav aria-label="Paginación" className="px-4 py-3 border-t border-gray-800 flex items-center justify-between">
            <p className="text-xs text-gray-500 tabular-nums">
              Mostrando {((page - 1) * pagination.limit) + 1}–{Math.min(page * pagination.limit, pagination.total)} de {pagination.total}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                aria-label="Página anterior"
                className="px-3 py-1 text-xs bg-gray-800 text-gray-400 rounded-lg disabled:opacity-40 hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 transition-colors"
              >
                ← Anterior
              </button>
              <span className="px-3 py-1 text-xs text-gray-500 tabular-nums" aria-current="page">
                {page} / {pagination.pages}
              </span>
              <button
                disabled={page === pagination.pages}
                onClick={() => setPage(p => p + 1)}
                aria-label="Página siguiente"
                className="px-3 py-1 text-xs bg-gray-800 text-gray-400 rounded-lg disabled:opacity-40 hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 transition-colors"
              >
                Siguiente →
              </button>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
