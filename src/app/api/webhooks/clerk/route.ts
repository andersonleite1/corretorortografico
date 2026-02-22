import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!CLERK_WEBHOOK_SECRET) {
        console.error("CLERK_WEBHOOK_SECRET não configurado.");
        return new NextResponse("Erro de configuração.", { status: 500 });
    }

    // Verificar autenticidade do webhook via cabeçalhos
    const headerPayload = await headers();
    const svixId = headerPayload.get("svix-id");
    const svixTimestamp = headerPayload.get("svix-timestamp");
    const svixSignature = headerPayload.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
        return new NextResponse("Cabeçalhos de webhook ausentes.", { status: 400 });
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(CLERK_WEBHOOK_SECRET);
    let event: WebhookEvent;

    try {
        event = wh.verify(body, {
            "svix-id": svixId,
            "svix-timestamp": svixTimestamp,
            "svix-signature": svixSignature,
        }) as WebhookEvent;
    } catch (err) {
        console.error("Erro ao verificar webhook:", err);
        return new NextResponse("Webhook inválido.", { status: 400 });
    }

    const { type, data } = event;

    // ===== EVENTO: Usuário criado ou atualizado =====
    if (type === "user.created" || type === "user.updated") {
        const { id, email_addresses, first_name, last_name, image_url } = data;
        const email = email_addresses[0]?.email_address;

        if (!email) {
            console.error("Email not found in Clerk event data.");
            return new NextResponse("Email não encontrado.", { status: 400 });
        }

        try {
            await db.user.upsert({
                where: { clerkId: id },
                create: {
                    clerkId: id,
                    email,
                    name: [first_name, last_name].filter(Boolean).join(" ") || null,
                    imageUrl: image_url || null,
                    subscription: {
                        create: {
                            plan: "free",
                            status: "active",
                        }
                    }
                },
                update: {
                    email,
                    name: [first_name, last_name].filter(Boolean).join(" ") || null,
                    imageUrl: image_url || null,
                },
            });
            console.log(`✅ Usuário ${type === "user.created" ? "criado" : "atualizado"} no DB: ${email}`);
        } catch (dbError) {
            console.error(`Error processing user ${type}:`, dbError);
            return new NextResponse("Erro ao processar usuário no banco de dados.", { status: 500 });
        }
    }

    // ===== EVENTO: Usuário deletado =====
    if (type === "user.deleted") {
        const { id } = data;
        try {
            await db.user.delete({ where: { clerkId: id as string } });
            console.log(`🗑️ Usuário deletado do DB: clerkId=${id}`);
        } catch (dbError) {
            console.error("Error deleting user:", dbError);
            // We return 500 here so Clerk will retry the webhook if an actual DB failure occurred
            return new NextResponse("Erro ao deletar usuário no banco.", { status: 500 });
        }
    }

    return new NextResponse("OK", { status: 200 });
}
