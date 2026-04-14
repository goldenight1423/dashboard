import { POSTURA_COLORS, IMAGINARIO_COLORS, SENTIMIENTO_COLORS } from './constants';

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(date: Date | string | null): string {
  if (!date) return '—';
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(date));
}

export function formatNumber(n: number | null | undefined): string {
  if (n == null) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function getPosturaColor(postura: string | null): string {
  return POSTURA_COLORS[postura ?? ''] ?? '#6B7280';
}

export function getImaginarioColor(imaginario: string | null): string {
  return IMAGINARIO_COLORS[imaginario ?? ''] ?? '#6B7280';
}

export function getSentimientoColor(sentimiento: string | null): string {
  return SENTIMIENTO_COLORS[sentimiento ?? ''] ?? '#6B7280';
}

export function pesoToPercent(peso: number | null): string {
  if (peso == null) return '—';
  return `${Math.round(peso * 100)}%`;
}
