import { PrismaClient } from "@prisma/client";

async function main() {
    const email = "editoronline@tuamaeaquelaursa.com";
    const proPriceId = "price_1T2TkuHDumOqO0chuLMUDSdG";
    const prisma = new PrismaClient();

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { subscription: true }
        });

        if (!user) {
            console.error(`❌ Erro: Usuário com email ${email} não encontrado.`);
            return;
        }

        console.log(`👤 Usuário encontrado: ${user.name || "Sem Nome"} (${user.clerkId})`);

        const result = await prisma.subscription.upsert({
            where: { userId: user.id },
            update: {
                plan: "pro",
                status: "active",
                stripePriceId: proPriceId,
                stripeCurrentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Válido por 1 ano
                updatedAt: new Date(),
            },
            create: {
                userId: user.id,
                plan: "pro",
                status: "active",
                stripePriceId: proPriceId,
                stripeCurrentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            },
        });

        console.log(`✅ Plano atualizado para PRO com sucesso para: ${email}`);
        console.log("Subscription ID:", result.id);
        console.log("Plano:", result.plan);
        console.log("Status:", result.status);
        console.log("Validade:", result.stripeCurrentPeriodEnd?.toISOString());

    } catch (error) {
        console.error("❌ Erro ao atualizar o plano do usuário:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
