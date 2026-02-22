import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import {
    DEFAULT_SETTINGS,
    DEFAULT_TONES,
} from "@/components/providers/editor-settings.constants";

/**
 * GET /api/editor-settings
 *
 * Retorna as configurações do editor do usuário autenticado.
 * Multi-tenancy: a query sempre filtra por `userId` do usuário autenticado,
 * garantindo que nenhum tenant possa acessar dados de outro.
 *
 * Se o usuário ainda não tem configurações salvas, retorna os defaults.
 */
export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const settings = await db.editorSettings.findUnique({
            where: {
                // Isolamento de tenant: garante que somente o registro
                // pertencente a este userId será retornado.
                userId: user.id,
            },
        });

        if (!settings) {
            // Usuário autenticado sem configurações salvas ainda — retorna defaults
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

/**
 * PUT /api/editor-settings
 *
 * Cria ou atualiza (upsert) as configurações do editor do usuário autenticado.
 * Multi-tenancy: usa `userId` como chave do upsert, nunca como parâmetro
 * vindo do body — o ID do tenant vem apenas do token de autenticação.
 *
 * Body esperado (todos opcionais — partial update):
 * {
 *   toolbarSettings?: Record<string, boolean>,
 *   activeTones?: Record<string, boolean>,
 *   customTones?: CustomTone[],
 * }
 */
export async function PUT(req: Request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { toolbarSettings, activeTones, customTones } = body;

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

        // Validação: customTones não pode exceder 5 itens
        if (Array.isArray(customTones) && customTones.length > 5) {
            return new NextResponse(
                "Máximo de 5 tons personalizados permitidos",
                { status: 400 }
            );
        }

        // Busca o registro atual para fazer merge parcial (evita sobrescrever
        // campos não enviados no body)
        const existing = await db.editorSettings.findUnique({
            where: { userId: user.id },
        });

        // Upsert com isolamento de tenant:
        // - `where.userId` garante que só o registro deste tenant é afetado
        // - `create.userId` vincula o novo registro ao tenant atual
        // - nunca confiamos no userId vindo do body
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
                        ...(existing?.toolbarSettings as object ?? DEFAULT_SETTINGS),
                        ...toolbarSettings,
                    },
                }),
                ...(activeTones !== undefined && {
                    activeTones: {
                        ...(existing?.activeTones as object ?? DEFAULT_TONES),
                        ...activeTones,
                    },
                }),
                ...(customTones !== undefined && { customTones }),
            },
        });

        return NextResponse.json({
            toolbarSettings: settings.toolbarSettings,
            activeTones: settings.activeTones,
            customTones: settings.customTones,
        });
    } catch (error) {
        console.error("[EDITOR_SETTINGS_PUT]", error);
        return new NextResponse("Erro Interno", { status: 500 });
    }
}
