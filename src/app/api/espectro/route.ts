import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const data = await prisma.$queryRaw<{
      persona_id: string;
      nombre: string;
      empresa: string;
      sector: string;
      postura_predominante: string;
      imaginario_predominante: string;
      avg_peso_trans: number;
      avg_confianza: number;
      total_publicaciones: bigint;
    }[]>`
      SELECT 
        persona_id, nombre, empresa, sector,
        postura_predominante, imaginario_predominante,
        ROUND(avg_peso_trans::numeric, 3) as avg_peso_trans,
        ROUND(avg_confianza::numeric, 3) as avg_confianza,
        total_publicaciones
      FROM v_resumen_ceos
      WHERE avg_peso_trans IS NOT NULL
      ORDER BY avg_peso_trans DESC
    `;

    // Histograma de peso_trans de todas las publicaciones
    const histograma = await prisma.$queryRaw<{ bucket: number; count: bigint }[]>`
      SELECT 
        FLOOR(peso_transhumanista * 10) / 10 as bucket,
        COUNT(*) as count
      FROM analisis_discursivo
      WHERE peso_transhumanista IS NOT NULL
      GROUP BY bucket
      ORDER BY bucket
    `;

    return NextResponse.json({
      ceos: data.map(c => ({
        ...c,
        total_publicaciones: Number(c.total_publicaciones),
      })),
      histograma: histograma.map(h => ({
        bucket: Number(h.bucket),
        count: Number(h.count),
        label: `${Math.round(Number(h.bucket) * 100)}%`,
      })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error espectro' }, { status: 500 });
  }
}
