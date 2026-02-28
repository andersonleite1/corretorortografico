/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://editordetexto.online", // seu domínio principal
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: "weekly",
  priority: 1,
  exclude: ["/private", "/post-csr"], // páginas que você não quer indexar
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/private", "/post-csr"],
      },
    ],
    additionalSitemaps: [],
  },
};
