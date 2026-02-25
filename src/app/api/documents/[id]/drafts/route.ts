import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { z } from "zod";

const draftSchema = z.object({
    title: z.string().max(500).optional(),
    content: z.string().min(1, "O conteúdo não pode estar vazio").max(500000, "O conteúdo excede o limite máximo de caracteres permitidos"),
    isExplicitSave: z.boolean().optional().default(false),
});

const MAX_DRAFTS = 5;
const THROTTLE_MINUTES = 30;

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id: documentId } = params;
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
        const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100);
        const skip = (page - 1) * limit;

        const totalCount = await db.draft.count({
            where: {
                documentId,
                document: {
                    userId: user.id
                }
            }
        });

        const drafts = await db.draft.findMany({
            where: {
                documentId,
                document: {
                    userId: user.id
                }
            },
            orderBy: {
                createdAt: "desc",
            },
            skip,
            take: limit,
        });

        return NextResponse.json({
            drafts,
            metadata: {
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page,
                limit,
            },
        });
    } catch (error) {
        console.error("[DRAFTS_GET]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser();
        const { id: documentId } = params;
        const body = await req.json();

        // Validar através do Zod (BUG-T02)
        const parseResult = draftSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({ error: parseResult.error.issues[0].message }, { status: 400 });
        }

        const { title, content, isExplicitSave } = parseResult.data;

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify document ownership
        const document = await db.document.findUnique({
            where: {
                id: documentId,
                userId: user.id
            }
        });

        if (!document) {
            return NextResponse.json({ error: "Document Not Found" }, { status: 404 });
        }

        const draft = await db.$transaction(async (tx) => {
            const now = new Date();
            const throttleLimit = new Date(now.getTime() - THROTTLE_MINUTES * 60 * 1000);

            // Check for latest draft within transaction
            const latestDraft = await tx.draft.findFirst({
                where: { documentId },
                orderBy: { createdAt: "desc" }
            });

            let resultDraft;

            if (!isExplicitSave && latestDraft && latestDraft.createdAt > throttleLimit) {
                // Update existing recently created draft
                resultDraft = await tx.draft.update({
                    where: { id: latestDraft.id },
                    data: {
                        title: title || latestDraft.title,
                        content: typeof content === "string" ? content : JSON.stringify(content)
                    }
                });
            } else {
                if (!content) {
                    throw new Error("Content is required");
                }

                // Create a new draft
                resultDraft = await tx.draft.create({
                    data: {
                        documentId,
                        title: (title || document.title || "Untitled").trim(),
                        content: typeof content === "string" ? content : JSON.stringify(content)
                    }
                });

                // Enforce the 5-draft limit
                const allDrafts = await tx.draft.findMany({
                    where: { documentId },
                    orderBy: { createdAt: "desc" },
                    select: { id: true }
                });

                if (allDrafts.length > MAX_DRAFTS) {
                    const draftIdsToDelete = allDrafts.slice(MAX_DRAFTS).map(d => d.id);
                    await tx.draft.deleteMany({
                        where: {
                            id: { in: draftIdsToDelete }
                        }
                    });
                }
            }
            return resultDraft;
        });

        return NextResponse.json(draft);
    } catch (error: any) {
        console.error("[DRAFTS_POST] Error detail:", error);
        const status = error.message === "Content is required" ? 400 : 500;
        return NextResponse.json({ error: error.message || "Internal Error" }, { status });
    }
}
