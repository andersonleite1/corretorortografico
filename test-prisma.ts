import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    try {
        const drafts = await prisma.draft.findMany();
        console.log("Found drafts:", drafts.length);
    } catch (e: any) {
        console.error("Error accessing draft model:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}
main();
