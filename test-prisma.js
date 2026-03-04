const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  try {
    console.log("Checking for draft model on prisma client...");
    if (prisma.draft) {
      console.log("SUCCESS: prisma.draft exists.");
      const drafts = await prisma.draft.findMany({ take: 1 });
      console.log("SUCCESS: Queried drafts:", drafts.length);
    } else {
      console.error("FAILURE: prisma.draft is UNDEFINED.");
    }
  } catch (e) {
    console.error("Error accessing draft model:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
