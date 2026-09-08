import { db } from "./db";

const MAX_WINDOW_SECONDS = 60 * 60;
let lastCleanupAt = 0;

export interface RatelimitResponse {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

class SlidingWindowRatelimit {
  private limitCount: number;
  private windowSeconds: number;
  private prefix: string;

  constructor(limitCount: number, windowStr: string, prefix: string) {
    this.limitCount = limitCount;
    this.prefix = prefix;
    
    const [val, unit] = windowStr.split(" ");
    let multiplier = 1;
    if (unit === "h") multiplier = 3600;
    else if (unit === "m") multiplier = 60;
    else if (unit === "s") multiplier = 1;
    
    this.windowSeconds = parseInt(val) * multiplier;
  }

  async limit(identifier: string): Promise<RatelimitResponse> {
    const key = `${this.prefix}:${identifier}`;
    const now = Date.now();
    const windowStart = now - (this.windowSeconds * 1000);

    // Evita o crescimento indefinido da tabela sem exigir um serviço externo.
    if (now - lastCleanupAt > 60_000) {
      lastCleanupAt = now;
      void db.rateLimitRequest
        .deleteMany({
          where: {
            createdAt: {
              lt: new Date(now - MAX_WINDOW_SECONDS * 1000),
            },
          },
        })
        .catch((error) =>
          console.warn(
            "[Rate limit cleanup] Falha ao remover registros antigos:",
            error,
          ),
        );
    }

    const result = await db.$transaction(async (tx) => {
      // Serializa requisições da mesma chave para que o count e o insert
      // sejam atômicos mesmo com múltiplas instâncias do servidor.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))`;

      await tx.rateLimitRequest.deleteMany({
        where: { key, createdAt: { lt: new Date(windowStart) } },
      });

      const count = await tx.rateLimitRequest.count({
        where: { key, createdAt: { gte: new Date(windowStart) } },
      });
      const success = count < this.limitCount;

      if (success) {
        await tx.rateLimitRequest.create({ data: { key } });
      }

      return { count: success ? count + 1 : count, success };
    });
    
    return {
      success: result.success,
      limit: this.limitCount,
      remaining: Math.max(0, this.limitCount - result.count),
      reset: now + (this.windowSeconds * 1000),
    };
  }
}

/**
 * Rate limit provisório sem dependência externa.
 *
 * O estado é local ao processo/instância. Isso é adequado como fallback
 * temporário, mas deve ser substituído por Redis ou PostgreSQL quando houver
 * múltiplas instâncias e necessidade de contagem global.
 */
class InMemorySlidingWindowRatelimit {
  private requests = new Map<string, number[]>();

  constructor(
    private readonly limitCount: number,
    private readonly windowMs: number,
  ) {}

  async limit(identifier: string): Promise<RatelimitResponse> {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const timestamps = (this.requests.get(identifier) ?? []).filter(
      (timestamp) => timestamp >= windowStart,
    );
    const success = timestamps.length < this.limitCount;

    if (success) {
      timestamps.push(now);
      this.requests.set(identifier, timestamps);
    } else {
      this.requests.set(identifier, timestamps);
    }

    return {
      success,
      limit: this.limitCount,
      remaining: Math.max(0, this.limitCount - timestamps.length),
      reset: (timestamps[0] ?? now) + this.windowMs,
    };
  }
}

/**
 * Utilitário de rate limit persistido no PostgreSQL.
 * O lock advisory por chave mantém o count e o insert atômicos.
 */
export const ratelimit = {
  bugReports: new SlidingWindowRatelimit(5, "1 h", "ratelimit:bug-reports"),
  // Temporário: evita que a indisponibilidade do banco derrube o corretor.
  // Defina LANGUAGETOOL_RATE_LIMIT_MODE=database para restaurar o modo antigo.
  languageTool:
    process.env.LANGUAGETOOL_RATE_LIMIT_MODE === "database"
      ? new SlidingWindowRatelimit(60, "1 m", "ratelimit:languagetool")
      : new InMemorySlidingWindowRatelimit(60, 60_000),
  ai: new SlidingWindowRatelimit(10, "10 m", "ratelimit:ai"),
  pdfExport: new SlidingWindowRatelimit(10, "1 m", "ratelimit:pdf"),
};
