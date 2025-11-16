import type { MetadataRoute } from "next";

const baseUrl = "https://editordetexto.online";

const staticRoutes = [
  { path: "/", priority: 1 },
  { path: "/post-ssr", priority: 0.9 },
  { path: "/editar-pdf", priority: 0.8 },
  { path: "/contato", priority: 0.6 },
  { path: "/privacidade", priority: 0.6 },
  { path: "/termos", priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return staticRoutes.map(({ path, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified,
    priority,
  }));
}
