import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const BugReportSchema = z.object({
    description: z.string().min(1, "Descrição é obrigatória").max(500),
    additionalInfo: z.string().max(2000).optional().nullable(),
    wantsNotification: z.boolean().default(false),
    notificationEmail: z.string().email("E-mail inválido").optional().nullable(),
    pageUrl: z.string().max(2048).optional().nullable(),
});

export async function POST(req: NextRequest) {
    try {
        const { userId: clerkId } = await auth();

        const body = await req.json();
        const parsed = BugReportSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Dados inválidos", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { description, additionalInfo, wantsNotification, notificationEmail, pageUrl } =
            parsed.data;

        // Se quer notificação, o e-mail é obrigatório
        if (wantsNotification && !notificationEmail) {
            return NextResponse.json(
                { error: "E-mail é obrigatório quando notificação está ativada." },
                { status: 400 }
            );
        }

        // Resolve userId interno a partir do clerkId
        let internalUserId: string | null = null;
        if (clerkId) {
            const user = await db.user.findUnique({
                where: { clerkId },
                select: { id: true },
            });
            internalUserId = user?.id ?? null;
        }

        const userAgent = req.headers.get("user-agent") ?? undefined;

        const report = await db.bugReport.create({
            data: {
                description,
                additionalInfo: additionalInfo?.trim() || null,
                wantsNotification,
                notificationEmail: wantsNotification ? (notificationEmail?.trim() || null) : null,
                userId: internalUserId,
                userAgent,
                pageUrl: pageUrl?.trim() || null,
                status: "open",
            },
        });

        return NextResponse.json({ id: report.id }, { status: 201 });
    } catch (error: any) {
        console.error("[bug-reports] Error:", error?.message || error);
        return NextResponse.json(
            { error: "Erro interno ao registrar o problema." },
            { status: 500 }
        );
    }
}
