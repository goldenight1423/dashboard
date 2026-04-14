import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const [
      totalCeos,
      totalPublicaciones,
      totalAnalizadas,
      distribucionPostura,
      distribucionImaginario,
      ultimasPublicaciones,
      sentimientoAvg,
    ] = await Promise.all([
      prisma.personas.count({ where: { activo: true } }),

      prisma.publicaciones.count({ where: { relevante_ia: true } }),

      prisma.publicaciones.count({ where: { relevante_ia: true, analizado: true } }),

      prisma.$queryRaw<{ postura_general: string; count: bigint }[]>`
        SELECT postura_general::text, COUNT(*) as count
        FROM analisis_discursivo
        WHERE postura_general IS NOT NULL
        GROUP BY postura_general
        ORDER BY count DESC
      `,

      prisma.$queryRaw<{ imaginario_dominante: string; count: bigint }[]>`
        SELECT imaginario_dominante::text, COUNT(*) as count
        FROM analisis_discursivo
        WHERE imaginario_dominante IS NOT NULL
        GROUP BY imaginario_dominante
        ORDER BY count DESC
      `,

      prisma.$queryRaw<{
        id: string; titulo: string; plataforma: string; fecha_publicacion: Date;
        nombre: string; empresa: string;
        postura_general: string; imaginario_dominante: string; sentimiento: string;
        confianza_clasificacion: number;
      }[]>`
        SELECT 
          pub.id, pub.titulo, pub.plataforma::text, pub.fecha_publicacion,
          p.nombre, p.empresa,
          ad.postura_general::text, ad.imaginario_dominante::text,
          ad.sentimiento::text, ad.confianza_clasificacion
        FROM publicaciones pub
        JOIN personas p ON p.id = pub.persona_id
        LEFT JOIN analisis_discursivo ad ON ad.publicacion_id = pub.id
        WHERE pub.relevante_ia = TRUE AND pub.analizado = TRUE
        ORDER BY pub.fecha_publicacion DESC
        LIMIT 10
      `,

      prisma.$queryRaw<{ avg: number }[]>`
        SELECT AVG(
          CASE sentimiento
            WHEN 'muy_positivo' THEN 1.0
            WHEN 'positivo' THEN 0.75
            WHEN 'neutro' THEN 0.5
            WHEN 'mixto' THEN 0.45
            WHEN 'negativo' THEN 0.25
            WHEN 'muy_negativo' THEN 0.0
          END
        ) as avg
        FROM analisis_discursivo
        WHERE sentimiento IS NOT NULL
      `,
    ]);

    const totalCount = distribucionPostura.reduce((s, r) => s + Number(r.count), 0);
    const posturas = distribucionPostura.map(r => ({
      postura: r.postura_general,
      count: Number(r.count),
      porcentaje: Math.round((Number(r.count) / totalCount) * 100),
    }));

    const totalImg = distribucionImaginario.reduce((s, r) => s + Number(r.count), 0);
    const imaginarios = distribucionImaginario.map(r => ({
      imaginario: r.imaginario_dominante,
      count: Number(r.count),
      porcentaje: Math.round((Number(r.count) / totalImg) * 100),
    }));

    return NextResponse.json({
      metricas: {
        totalCeos,
        totalPublicaciones,
        totalAnalizadas,
        sentimientoAvg: Math.round((sentimientoAvg[0]?.avg ?? 0.5) * 100) / 100,
        imaginarioDominante: imaginarios[0]?.imaginario ?? 'N/A',
        imaginarioDominantePct: imaginarios[0]?.porcentaje ?? 0,
      },
      posturas,
      imaginarios,
      ultimasPublicaciones,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error al consultar datos' }, { status: 500 });
  }
}
