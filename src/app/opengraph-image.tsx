import { ImageResponse } from "next/og";

export const alt =
  "CorretorOrtografico.online — corretor ortográfico online grátis em português brasileiro, sem cadastro.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px",
        background: "#f7f9fc",
        color: "#0f172a",
        borderTop: "12px solid #1d4ed8",
      }}
    >
      <div style={{ display: "flex", fontSize: 28 }}>
        <span style={{ color: "#1d4ed8" }}>Corretor</span>
        <span>Ortografico.online</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontSize: 68, lineHeight: 1.15, maxWidth: 950 }}>
          Corretor ortográfico online grátis
        </div>
        <div style={{ fontSize: 30, color: "#475569", lineHeight: 1.5 }}>
          Revise ortografia, gramática e pontuação com o LanguageTool.
        </div>
      </div>
      <div style={{ display: "flex", fontSize: 26, color: "#1d4ed8" }}>
        Português brasileiro · Sem cadastro
      </div>
    </div>,
    size,
  );
}
