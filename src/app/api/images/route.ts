import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resources } = await cloudinary.search
      .expression(`resource_type:image AND tags=${userId}`)
      .sort_by("created_at", "desc")
      .execute();

    const map = resources.map((item: any) => ({
      id: item.public_id,
      url: item.secure_url,
      created_at: item.created_at,
      bytes: item.bytes,
      format: item.format,
      display_name: item.display_name || item.public_id,
      width: item.width,
      height: item.height,
    }));

    return NextResponse.json(map);
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ALLOWED_TYPES = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Tipo de arquivo não permitido. Apenas JPEG, PNG, WEBP e GIF são suportados.",
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Arquivo muito grande (máx. 5 MB)." },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: `${userId}/${Date.now()}-${file.name.split(/\.\w+$/)[0]}`,
          resource_type: "image",
          invalidate: true,
          tags: [userId],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );

      uploadStream.end(buffer);
    });

    if (result) {
      return NextResponse.json({
        id: result.public_id,
        url: result.secure_url,
        created_at: result.created_at,
        bytes: result.bytes,
        format: result.format,
        display_name: result.display_name || result.public_id,
        width: result.width,
        height: result.height,
      });
    } else {
      // BUG-02: Retorna erro se o upload falhar silenciosamente
      return NextResponse.json(
        { error: "Falha ao realizar upload para a nuvem." },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
}
