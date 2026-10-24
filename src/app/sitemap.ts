import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://corretorortografico.online/",
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: "https://corretorortografico.online/sobre",
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: "https://corretorortografico.online/privacidade",
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
