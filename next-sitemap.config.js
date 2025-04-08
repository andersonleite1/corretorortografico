/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://editordetexto.online', // seu domínio principal
  generateRobotsTxt: true,
  sitemapSize: 5000,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/private'], // páginas que você não quer indexar
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/private'],
      },
    ],
    additionalSitemaps: [
    ],
  },
};
