import { db } from "@/lib/db";
import { getCurrentUser, getUserPlan } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();
        const plan = await getUserPlan();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Permitir salvamento apenas para usuários Pro ou Team
        if (plan === "free") {
            return new NextResponse("Upgrade ao plano Pro para salvar documentos", { status: 403 });
        }

        const body = await req.json();
        const { id, title, content } = body;

        if (!content) {
            return new NextResponse("Conteúdo é obrigatório", { status: 400 });
        }

        let document;

        if (id) {
            // Atualizar documento existente
            document = await db.document.update({
                where: {
                    id,
                    userId: user.id,
                },
                data: {
                    title: title || "Sem título",
                    content,
                },
            });
        } else {
            // Criar novo documento
            document = await db.document.create({
                data: {
                    userId: user.id,
                    title: title || "Sem título",
                    content,
                },
            });
        }

        return NextResponse.json(document);
    } catch (error) {
        console.error("[DOCUMENTS_POST]", error);
        return new NextResponse("Erro Interno", { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const documents = await db.document.findMany({
            where: {
                userId: user.id,
            },
            orderBy: {
                updatedAt: "desc",
            },
        });

        return NextResponse.json(documents);
    } catch (error) {
        console.error("[DOCUMENTS_GET]", error);
        return new NextResponse("Erro Interno", { status: 500 });
    }
}
