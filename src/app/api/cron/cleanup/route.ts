import { db } from "@/lib/db";
import { NextResponse } from "next/server";

/**
 * ESC-04: Implementação de limpeza automática de dados de uso de IA.
 * Este endpoint deve ser chamado periodicamente (ex: Vercel Cron) para
 * evitar que a tabela ai_usage cresça indefinidamente.
 */
export async function GET(req: Request) {
  // Proteção básica via Header (Vercel Cron envia um token específico se configurado)
  // Ou podemos usar uma SECRET_KEY
  const authHeader = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Definimos um limite de retenção (ex: 3 meses)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const deleted = await db.aiUsage.deleteMany({
      where: {
        createdAt: {
          lt: threeMonthsAgo,
        },
      },
    });

    console.log(
      `[Cron Cleanup] Deleted ${deleted.count} old AI usage records.`,
    );

    return NextResponse.json({
      success: true,
      deletedCount: deleted.count,
      message: `Registros anteriores a ${threeMonthsAgo.toLocaleDateString()} foram removidos.`,
    });
  } catch (error) {
    console.error("[Cron Cleanup Error]:", error);
    return NextResponse.json(
      { error: "Falha na limpeza de dados históricos." },
      { status: 500 },
    );
  }
}
