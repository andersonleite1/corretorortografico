import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Editor de Texto Online",
    short_name: "Editor",
    description: "Um editor de texto rápido, moderno e offline-capable.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563eb",
    icons: [
      {
        src: "/logo.webp",
        sizes: "192x192 512x512",
        type: "image/webp",
        purpose: "any maskable"
      },
    ],
  };
}
