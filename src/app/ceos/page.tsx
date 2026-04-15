'use client';

import { useEffect, useState } from 'react';
import { POSTURA_LABELS, POSTURA_COLORS, IMAGINARIO_LABELS, IMAGINARIO_COLORS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

interface CEO {
  persona_id: string; nombre: string; cargo: string; empresa: string; sector: string;
  total_publicaciones: number; total_analizadas: number;
  postura_predominante: string; imaginario_predominante: string;
  avg_peso_trans: number; avg_confianza: number; ultima_publicacion: string;
}

type SortKey = keyof CEO;

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
      {label}
    </span>
  );
}

export default function CEOsPage() {
  const [ceos, setCeos] = useState<CEO[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({
    key: 'total_publicaciones', dir: 'desc',
  });

  useEffect(() => {
    fetch('/api/ceos')
      .then(r => r.json())
      .then(d => { setCeos(d.data); setLoading(false); });
  }, []);

  const sorted = [...ceos].sort((a, b) => {
    const av = a[sort.key], bv = b[sort.key];
    if (av == null) return 1;
    if (bv == null) return -1;
    return sort.dir === 'asc'
      ? av < bv ? -1 : 1
      : av > bv ? -1 : 1;
  });

  const toggleSort = (key: SortKey) => {
    setSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' });
  };

  // Accessible sortable column header
  const Th = ({ k, label }: { k: SortKey; label: string }) => {
    const isActive = sort.key === k;
    const dir = isActive ? sort.dir : undefined;
    return (
      <th
        scope="col"
        role="columnheader"
        aria-sort={isActive ? (dir === 'desc' ? 'descending' : 'ascending') : 'none'}
        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider select-none whitespace-nowrap"
      >
        <button
          onClick={() => toggleSort(k)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSort(k); } }}
          className="flex items-center gap-1 hover:text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:rounded"
        >
          {label}
          <span aria-hidden="true" className="text-gray-600">
            {isActive ? (dir === 'desc' ? ' ↓' : ' ↑') : ' ↕'}
          </span>
        </button>
      </th>
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full" role="status" aria-live="polite">
      <p className="text-gray-500">Cargando CEOs…</p>
    </div>
  );

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white text-balance">CEOs Monitoreados</h1>
        <p className="text-sm text-gray-500 mt-0.5">{ceos.length} directivos en el corpus</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Tabla de CEOs monitoreados">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/80">
                <Th k="nombre" label="Nombre" />
                <Th k="empresa" label="Empresa" />
                <Th k="sector" label="Sector" />
                <Th k="total_publicaciones" label="Pubs." />
                <Th k="postura_predominante" label="Postura" />
                <Th k="imaginario_predominante" label="Imaginario" />
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Peso trans.
                </th>
                <Th k="avg_confianza" label="Confianza" />
                <Th k="ultima_publicacion" label="Última pub." />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {sorted.map(ceo => (
                <tr key={ceo.persona_id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-200">{ceo.nombre}</p>
                    <p className="text-xs text-gray-500">{ceo.cargo}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{ceo.empresa}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs capitalize">{ceo.sector}</td>
                  <td className="px-4 py-3 text-gray-300 tabular-nums">
                    <span className="text-white font-bold">{ceo.total_analizadas}</span>
                    <span className="text-gray-600">/{ceo.total_publicaciones}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      label={POSTURA_LABELS[ceo.postura_predominante] ?? ceo.postura_predominante}
                      color={POSTURA_COLORS[ceo.postura_predominante] ?? '#6B7280'}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      label={IMAGINARIO_LABELS[ceo.imaginario_predominante] ?? ceo.imaginario_predominante}
                      color={IMAGINARIO_COLORS[ceo.imaginario_predominante] ?? '#6B7280'}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden"
                        role="progressbar"
                        aria-valuenow={ceo.avg_peso_trans ? Math.round(ceo.avg_peso_trans * 100) : 0}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Peso transhumanista: ${ceo.avg_peso_trans ? Math.round(ceo.avg_peso_trans * 100) : 0}%`}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: ceo.avg_peso_trans ? `${Math.round(ceo.avg_peso_trans * 100)}%` : '0%',
                            background: 'linear-gradient(to right, #10B981, #EF4444)',
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 tabular-nums">
                        {ceo.avg_peso_trans ? `${Math.round(ceo.avg_peso_trans * 100)}%` : '—'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm tabular-nums ${
                      (ceo.avg_confianza ?? 0) >= 0.8 ? 'text-green-400'
                      : (ceo.avg_confianza ?? 0) >= 0.6 ? 'text-yellow-400'
                      : 'text-red-400'
                    }`}>
                      {ceo.avg_confianza ? `${Math.round(ceo.avg_confianza * 100)}%` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {formatDate(ceo.ultima_publicacion)}
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
