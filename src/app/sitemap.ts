import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `https://editordetexto.online`,
      lastModified: new Date(),
      priority: 1
    }
  ];
}
