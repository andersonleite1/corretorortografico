/**
 * Utilitário de rate limiting por IP em memória.
 *
 * ⚠️ NOTA: Esta implementação é adequada para instância única (MVP).
 * Em ambientes com múltiplas instâncias (ex: Vercel Serverless em escala),
 * migrar para uma solução distribuída como Upstash Redis (@upstash/ratelimit).
 */

interface RateLimitEntry {
    count: number;
    resetAt: number; // timestamp em ms
}

// Cada "key" (ex: "bug-reports") possui seu próprio mapa de IPs
const stores = new Map<string, Map<string, RateLimitEntry>>();

// Limpeza periódica para evitar memory leak (executa a cada hora)
if (typeof setInterval !== "undefined") {
    setInterval(
        () => {
            const now = Date.now();
            for (const store of stores.values()) {
                for (const [ip, entry] of store.entries()) {
                    if (now > entry.resetAt) {
                        store.delete(ip);
                    }
                }
            }
        },
        60 * 60 * 1000,
    );
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: number; // timestamp em ms
}

/**
 * Verifica e incrementa o contador de rate limit para um IP e chave (endpoint) específicos.
 *
 * @param ip - Endereço IP do cliente
 * @param key - Identificador do endpoint (ex: "bug-reports")
 * @param limit - Número máximo de requisições permitidas na janela de tempo
 * @param windowMs - Duração da janela em milissegundos (padrão: 1 hora)
 */
export function getIpRateLimit(
    ip: string,
    key: string,
    limit: number,
    windowMs: number = 60 * 60 * 1000, // 1 hora padrão
): RateLimitResult {
    if (!stores.has(key)) {
        stores.set(key, new Map());
    }
    const store = stores.get(key)!;

    const now = Date.now();
    const entry = store.get(ip);

    // Janela expirada ou primeira requisição
    if (!entry || now > entry.resetAt) {
        const newEntry: RateLimitEntry = { count: 1, resetAt: now + windowMs };
        store.set(ip, newEntry);
        return { allowed: true, remaining: limit - 1, resetAt: newEntry.resetAt };
    }

    // Dentro da janela
    if (entry.count >= limit) {
        return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }

    entry.count++;
    return {
        allowed: true,
        remaining: limit - entry.count,
        resetAt: entry.resetAt,
    };
}
