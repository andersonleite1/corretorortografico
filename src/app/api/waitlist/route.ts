import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { device, info } = body;

    const email = user.emailAddresses[0]?.emailAddress;

    if (!email) {
      return NextResponse.json({ error: "Email missing" }, { status: 400 });
    }

    // Get IP address from headers
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor
      ? forwardedFor.split(",")[0]
      : req.headers.get("x-real-ip") || "unknown";

    // You can also get region from Vercel headers if deployed to Vercel (e.g. x-vercel-ip-country)
    const region = req.headers.get("x-vercel-ip-country") || "unknown-region";

    // Insert into DB
    const waitlistEntry = await db.waitlist.upsert({
      where: { email },
      update: {
        region,
        device,
        info,
      },
      create: {
        email,
        region,
        device,
        info,
      },
    });

    return NextResponse.json({ success: true, waitlistEntry });
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
