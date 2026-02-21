import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

const MAX_DRAFTS = 5;
const THROTTLE_MINUTES = 30;

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser();
        const { id: documentId } = params;

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

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
        });

        return NextResponse.json(drafts);
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
        const dbModels = Object.keys(db).filter(k => !k.startsWith('_') && !k.startsWith('$'));
        if (req.headers.get("x-diagnose") === "true") {
            return NextResponse.json({
                dbModels,
                dbDraftType: typeof (db as any).draft,
                documentInModels: dbModels.includes("document"),
                draftInModels: dbModels.includes("draft")
            });
        }

        const user = await getCurrentUser();
        const { id: documentId } = params;
        const body = await req.json();
        const { title, content, isExplicitSave } = body;

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

        const now = new Date();
        const throttleLimit = new Date(now.getTime() - THROTTLE_MINUTES * 60 * 1000);

        // Check for latest draft
        const latestDraft = await db.draft.findFirst({
            where: { documentId },
            orderBy: { createdAt: "desc" }
        });

        let draft;

        if (!isExplicitSave && latestDraft && latestDraft.createdAt > throttleLimit) {
            // Update existing recently created draft
            draft = await db.draft.update({
                where: { id: latestDraft.id },
                data: {
                    title: title || latestDraft.title,
                    content
                }
            });
        } else {
            if (!content) {
                return NextResponse.json({ error: "Content is required" }, { status: 400 });
            }

            // Create a new draft
            draft = await db.draft.create({
                data: {
                    documentId,
                    title: (title || document.title || "Untitled").trim(),
                    content: typeof content === "string" ? content : JSON.stringify(content)
                }
            });

            // Enforce the 5-draft limit
            const allDrafts = await db.draft.findMany({
                where: { documentId },
                orderBy: { createdAt: "desc" },
                select: { id: true }
            });

            if (allDrafts.length > MAX_DRAFTS) {
                const draftIdsToDelete = allDrafts.slice(MAX_DRAFTS).map(d => d.id);
                await db.draft.deleteMany({
                    where: {
                        id: { in: draftIdsToDelete }
                    }
                });
            }
        }

        return NextResponse.json(draft);
    } catch (error) {
        console.error("[DRAFTS_POST] Error detail:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Error" }, { status: 500 });
    }
}
