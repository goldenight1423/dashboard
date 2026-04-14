import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const ceos = await prisma.$queryRaw<{
      persona_id: string;
      nombre: string;
      cargo: string;
      empresa: string;
      sector: string;
      total_publicaciones: bigint;
      total_analizadas: bigint;
      postura_predominante: string;
      imaginario_predominante: string;
      avg_peso_trans: number;
      avg_peso_post: number;
      avg_confianza: number;
      ultima_publicacion: Date;
    }[]>`SELECT * FROM v_resumen_ceos ORDER BY total_publicaciones DESC`;

    const result = ceos.map(c => ({
      ...c,
      total_publicaciones: Number(c.total_publicaciones),
      total_analizadas: Number(c.total_analizadas),
      avg_peso_trans: c.avg_peso_trans ? Math.round(c.avg_peso_trans * 100) / 100 : null,
      avg_peso_post: c.avg_peso_post ? Math.round(c.avg_peso_post * 100) / 100 : null,
      avg_confianza: c.avg_confianza ? Math.round(c.avg_confianza * 100) / 100 : null,
    }));

    return NextResponse.json({ data: result });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error al consultar CEOs' }, { status: 500 });
  }
}
