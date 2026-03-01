import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

/**
 * Utilitário de Rate Limit usando Upstash Redis.
 * Diferente do Map em memória, este estado persiste entre requisições Serverless.
 */
export const ratelimit = {
    /**
     * Limite para reporte de bugs (SEG-01)
     * 5 requisições por hora
     */
    bugReports: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "1 h"),
        prefix: "@upstash/ratelimit/bug-reports",
    }),

    /**
     * Limite para ferramenta de gramática (SEG-02)
     * 30 requisições por hora
     */
    languageTool: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(30, "1 h"),
        prefix: "@upstash/ratelimit/languagetool",
    }),

    /**
     * Limite para uso de IA (Geral)
     * 10 requisições a cada 10 minutos
     */
    ai: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "10 m"),
        prefix: "@upstash/ratelimit/ai",
    }),

    /**
     * Limite para exportação de PDF (SEG-04)
     * 10 requisições por minuto
     */
    pdfExport: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "1 m"),
        prefix: "@upstash/ratelimit/pdf",
    }),
};
