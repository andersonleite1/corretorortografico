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
    const headerPayload = headers();
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

    // ===== EVENTO: Usuário criado =====
    if (type === "user.created") {
        const { id, email_addresses, first_name, last_name, image_url } = data;
        const email = email_addresses[0]?.email_address;

        if (!email) {
            return new NextResponse("Email não encontrado.", { status: 400 });
        }

        await db.user.create({
            data: {
                clerkId: id,
                email,
                name: [first_name, last_name].filter(Boolean).join(" ") || null,
                imageUrl: image_url || null,
            },
        });

        console.log(`✅ Usuário criado no DB: ${email}`);
    }

    // ===== EVENTO: Usuário atualizado =====
    if (type === "user.updated") {
        const { id, email_addresses, first_name, last_name, image_url } = data;
        const email = email_addresses[0]?.email_address;

        await db.user.update({
            where: { clerkId: id },
            data: {
                email: email || undefined,
                name: [first_name, last_name].filter(Boolean).join(" ") || null,
                imageUrl: image_url || null,
            },
        });
    }

    // ===== EVENTO: Usuário deletado =====
    if (type === "user.deleted") {
        const { id } = data;
        await db.user.delete({ where: { clerkId: id as string } });
        console.log(`🗑️ Usuário deletado do DB: clerkId=${id}`);
    }

    return new NextResponse("OK", { status: 200 });
}
