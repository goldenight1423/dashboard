import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = 20;
  const offset = (page - 1) * limit;
  const postura = searchParams.get('postura') ?? '';
  const imaginario = searchParams.get('imaginario') ?? '';

  try {
    const where = `
      WHERE pub.relevante_ia = TRUE AND pub.analizado = TRUE
      ${postura ? `AND ad.postura_general::text = '${postura}'` : ''}
      ${imaginario ? `AND ad.imaginario_dominante::text = '${imaginario}'` : ''}
    `;

    const [rows, countResult] = await Promise.all([
      prisma.$queryRawUnsafe<{
        id: string; titulo: string; plataforma: string; tipo_contenido: string;
        fecha_publicacion: Date; contenido_limpio: string;
        nombre: string; empresa: string;
        postura_general: string; imaginario_dominante: string;
        sentimiento: string; confianza_clasificacion: number;
        likes: number; shares: number; engagement_rate: number;
      }[]>(`
        SELECT 
          pub.id, pub.titulo, pub.plataforma::text, pub.tipo_contenido::text,
          pub.fecha_publicacion, LEFT(pub.contenido_limpio, 120) as contenido_limpio,
          p.nombre, p.empresa,
          ad.postura_general::text, ad.imaginario_dominante::text,
          ad.sentimiento::text, ad.confianza_clasificacion,
          r.likes, r.shares, r.engagement_rate
        FROM publicaciones pub
        JOIN personas p ON p.id = pub.persona_id
        LEFT JOIN analisis_discursivo ad ON ad.publicacion_id = pub.id
        LEFT JOIN LATERAL (
          SELECT likes, shares, engagement_rate FROM reacciones
          WHERE publicacion_id = pub.id ORDER BY fecha_captura DESC LIMIT 1
        ) r ON TRUE
        ${where}
        ORDER BY pub.fecha_publicacion DESC
        LIMIT ${limit} OFFSET ${offset}
      `),

      prisma.$queryRawUnsafe<{ total: bigint }[]>(`
        SELECT COUNT(*) as total
        FROM publicaciones pub
        LEFT JOIN analisis_discursivo ad ON ad.publicacion_id = pub.id
        ${where}
      `),
    ]);

    const total = Number(countResult[0]?.total ?? 0);

    return NextResponse.json({
      data: rows,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error publicaciones' }, { status: 500 });
  }
}
