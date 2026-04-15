import { db } from "@/lib/db";
import { getCurrentUser, getUserPlan } from "@/lib/auth";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { z } from "zod";

const documentSchema = z.object({
  id: z.string().cuid().nullable().optional(),
  title: z.string().max(500).nullable().optional(),
  content: z
    .string()
    .min(1, "Conteúdo é obrigatório")
    .max(500000, "Conteúdo excede o limite máximo permitido (500KB)"),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const parseResult = documentSchema.safeParse(body);
    if (!parseResult.success) {
      return new NextResponse(
        parseResult.error.issues.map((e: z.ZodIssue) => e.message).join(", "),
        { status: 400 },
      );
    }

    const plan = await getUserPlan();
    if (plan === "free") {
      return new NextResponse(
        "O armazenamento na nuvem é um recurso do plano Pro.",
        { status: 403 },
      );
    }

    const { id, title, content } = parseResult.data;

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

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100);
    const skip = (page - 1) * limit;

    const totalCount = await db.document.count({
      where: {
        userId: user.id,
      },
    });

    const documents = await db.document.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      skip,
      take: limit,
    });

    return NextResponse.json(
      {
        documents,
        metadata: {
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
          limit,
        },
      },
      {
        headers: {
          "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("[DOCUMENTS_GET]", error);
    return new NextResponse("Erro Interno", { status: 500 });
  }
}
