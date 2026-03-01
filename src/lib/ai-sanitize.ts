/**
 * Sanitização de inputs enviados para prompts de IA.
 *
 * Previne ataques de Prompt Injection bloqueando padrões comuns de jailbreak
 * que tentam sobrescrever o system prompt ou manipular o comportamento do modelo.
 */

// Máximo de caracteres permitidos para campos de instrução do usuário
const MAX_CUSTOM_INSTRUCTIONS_LENGTH = 500;

/**
 * Padrões de prompt injection conhecidos (case-insensitive).
 * Cada entrada é substituída por string vazia se detectada.
 */
const INJECTION_PATTERNS: RegExp[] = [
    // Comandos de override de sistema
    /ignore\s+(all\s+)?(the\s+)?(previous|above|prior|earlier)\s+(instructions?|prompts?|rules?|context)/gi,
    /ignore\s+(todas\s+)?(as\s+|os\s+)?(instruç(ão|ões)|regras?|prompt|sistema)\s*(anterior(es)?)?/gi,
    /esqueça\s+(tudo|as\s+instruções|o\s+que\s+foi\s+dito)/gi,
    /forget\s+(all|everything|previous|the\s+above)/gi,

    // Tentativas de redefinir o papel do modelo
    /\bact\s+as\b/gi,
    /\bpretend\s+(to\s+be|you\s+are)\b/gi,
    /\byou\s+are\s+now\b/gi,
    /\byou\s+are\s+a\b/gi,
    /\bagora\s+você\s+(é|será|deve\s+ser)\b/gi,

    // Tokens e delimitadores de prompt
    /\[INST\]/gi,
    /\[\/INST\]/gi,
    /<\|system\|>/gi,
    /<\|user\|>/gi,
    /<\|assistant\|>/gi,
    /<<SYS>>/gi,
    /<\/SYS>/gi,

    // Prefixos de role injection
    /^system\s*:/gim,
    /^assistant\s*:/gim,
    /^human\s*:/gim,
    /^ai\s*:/gim,

    // Tentativas de extrair o system prompt
    /repeat\s+(above|everything|the\s+system)/gi,
    /repita\s+(tudo|o\s+sistema|as\s+instruções)/gi,
    /print\s+(your\s+)?(system\s+prompt|instructions)/gi,
    /mostre?\s+(o\s+)?(system\s+prompt|suas\s+instruções)/gi,

    // Injeções DAN / jailbreak genérico
    /\bDAN\b/g,
    /do\s+anything\s+now/gi,
    /jailbreak/gi,
];

/**
 * Sanitiza uma string de instrução personalizada do usuário para uso em prompts de IA.
 *
 * - Remove padrões de prompt injection conhecidos
 * - Trunca para o limite máximo permitido
 * - Preserva texto legítimo do usuário
 *
 * @param input - Instrução fornecida pelo usuário
 * @returns String sanitizada e truncada
 */
export function sanitizeAiInput(input: string): string {
    if (!input || typeof input !== "string") return "";

    let sanitized = input;

    // Aplica cada padrão de bloqueio
    for (const pattern of INJECTION_PATTERNS) {
        sanitized = sanitized.replace(pattern, "");
    }

    // Remove múltiplos espaços/quebras de linha gerados pela substituição
    sanitized = sanitized.replace(/\s{3,}/g, "  ").trim();

    // Trunca para o limite máximo
    if (sanitized.length > MAX_CUSTOM_INSTRUCTIONS_LENGTH) {
        sanitized = sanitized.slice(0, MAX_CUSTOM_INSTRUCTIONS_LENGTH);
    }

    return sanitized;
}
