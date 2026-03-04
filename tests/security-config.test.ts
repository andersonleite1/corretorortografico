import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Security Configuration - CSP (SEG-06)", () => {
  it("garante que 'unsafe-eval' não está presente no Content-Security-Policy", () => {
    const configPath = path.join(process.cwd(), "next.config.mjs");
    const content = fs.readFileSync(configPath, "utf8");

    // Procura pela string da CSP
    const cspMatch = content.match(
      /value:\s*process\.env\.NODE_ENV\s*===\s*"development"\s*\?\s*"[^"]+"\s*:\s*"([^"]+)"/,
    );
    expect(cspMatch).not.toBeNull();

    const cspValue = cspMatch![1];

    // Verifica ausência de 'unsafe-eval'
    expect(cspValue).not.toContain("'unsafe-eval'");

    // Verifica presença de diretivas essenciais
    expect(cspValue).toContain("default-src 'self'");
    expect(cspValue).toContain("script-src 'self'");
  });

  it("garante que 'unsafe-inline' é mantido apenas para script-src/style-src conforme decisão de arquitetura", () => {
    const configPath = path.join(process.cwd(), "next.config.mjs");
    const content = fs.readFileSync(configPath, "utf8");

    const cspMatch = content.match(
      /value:\s*process\.env\.NODE_ENV\s*===\s*"development"\s*\?\s*"[^"]+"\s*:\s*"([^"]+)"/,
    );
    const cspValue = cspMatch![1];

    expect(cspValue).toContain("script-src 'self' 'unsafe-inline'");
    expect(cspValue).toContain("style-src 'self' 'unsafe-inline'");
  });
});
