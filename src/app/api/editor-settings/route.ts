import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import {
  DEFAULT_SETTINGS,
  DEFAULT_TONES,
} from "@/components/providers/editor-settings.constants";
import { z } from "zod";

const settingsSchema = z.object({
  toolbarSettings: z.record(z.string(), z.boolean()).optional(),
  activeTones: z.record(z.string(), z.boolean()).optional(),
  customTones: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1).max(50),
        description: z.string().min(1).max(200),
        priority: z.number().optional().default(0),
        instructions: z.string().min(1).max(1000).optional(),
      }),
    )
    .max(5)
    .optional(),
});

/**
 * GET /api/editor-settings
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const settings = await db.editorSettings.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!settings) {
      return NextResponse.json({
        toolbarSettings: DEFAULT_SETTINGS,
        activeTones: DEFAULT_TONES,
        customTones: [],
      });
    }

    return NextResponse.json({
      toolbarSettings: settings.toolbarSettings ?? DEFAULT_SETTINGS,
      activeTones: settings.activeTones ?? DEFAULT_TONES,
      customTones: settings.customTones ?? [],
    });
  } catch (error) {
    console.error("[EDITOR_SETTINGS_GET]", error);
    return new NextResponse("Erro Interno", { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { toolbarSettings, activeTones, customTones } =
      settingsSchema.parse(body);

    // Validação mínima: pelo menos um campo deve ser enviado
    if (
      toolbarSettings === undefined &&
      activeTones === undefined &&
      customTones === undefined
    ) {
      return new NextResponse("Nenhum campo para atualizar", {
        status: 400,
      });
    }

    // Busca o registro atual para fazer merge parcial (evita sobrescrever
    // campos não enviados no body)
    const existing = await db.editorSettings.findUnique({
      where: { userId: user.id },
    });

    // Upsert com isolamento de tenant
    const settings = await db.editorSettings.upsert({
      where: {
        userId: user.id,
      },
      create: {
        userId: user.id,
        toolbarSettings: toolbarSettings ?? DEFAULT_SETTINGS,
        activeTones: activeTones ?? DEFAULT_TONES,
        customTones: customTones ?? [],
      },
      update: {
        // Merge parcial: só atualiza os campos presentes no body
        ...(toolbarSettings !== undefined && {
          toolbarSettings: {
            ...((existing?.toolbarSettings as Record<string, any>) ??
              DEFAULT_SETTINGS),
            ...toolbarSettings,
          } as any,
        }),
        ...(activeTones !== undefined && {
          activeTones: {
            ...((existing?.activeTones as Record<string, any>) ??
              DEFAULT_TONES),
            ...activeTones,
          } as any,
        }),
        ...(customTones !== undefined && { customTones: customTones as any }),
      },
    });

    return NextResponse.json({
      toolbarSettings: settings.toolbarSettings,
      activeTones: settings.activeTones,
      customTones: settings.customTones,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Dados inválidos",
          details: error.issues,
        },
        { status: 400 },
      );
    }
    console.error("[EDITOR_SETTINGS_PUT]", error);
    return new NextResponse("Erro Interno", { status: 500 });
  }
}
