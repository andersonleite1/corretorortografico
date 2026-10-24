import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Security Configuration - CSP (SEG-06)", () => {
  it("garante que 'unsafe-eval' não está presente no Content-Security-Policy", () => {
    const configPath = path.join(process.cwd(), "next.config.mjs");
    const content = fs.readFileSync(configPath, "utf8");

    const cspValue = content.match(
      /key:\s*"Content-Security-Policy",\s*value:\s*"([^"]+)"/s,
    )?.[1];
    expect(cspValue).toBeDefined();

    // Verifica ausência de 'unsafe-eval'
    expect(cspValue).not.toContain("'unsafe-eval'");

    // Verifica presença de diretivas essenciais
    expect(cspValue).toContain("default-src 'self'");
    expect(cspValue).toContain("script-src 'self'");
  });

  it("garante que 'unsafe-inline' é mantido apenas para script-src/style-src conforme decisão de arquitetura", () => {
    const configPath = path.join(process.cwd(), "next.config.mjs");
    const content = fs.readFileSync(configPath, "utf8");

    const cspValue = content.match(
      /key:\s*"Content-Security-Policy",\s*value:\s*"([^"]+)"/s,
    )?.[1];
    expect(cspValue).toBeDefined();

    const directives = Object.fromEntries(
      cspValue!.split(";").map((directive) => {
        const [name, ...values] = directive.trim().split(/\s+/);
        return [name, values];
      }),
    );
    expect(directives["script-src"]).toContain("'unsafe-inline'");
    expect(directives["style-src"]).toContain("'unsafe-inline'");
    expect(directives["default-src"]).not.toContain("'unsafe-inline'");
  });
});
