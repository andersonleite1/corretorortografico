import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUser();
    const { id } = params;

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const document = await db.document.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!document) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error("[DOCUMENT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUser();
    const { id } = params;

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const document = await db.document.delete({
      where: {
        id,
        userId: user.id,
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error("[DOCUMENT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
