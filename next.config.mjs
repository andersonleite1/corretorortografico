import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  experimental: {
    nextScriptWorkers: true,
    serverComponentsExternalPackages: ["isomorphic-dompurify"],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            svgoConfig: {
              plugins: [
                {
                  name: "preset-default",
                  params: {
                    overrides: {
                      removeViewBox: false,
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    });
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/editar-pdf",
        destination: "/",
        permanent: true,
      },
      {
        source: "/edit-pdf",
        destination: "/",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value:
              process.env.NODE_ENV === "development"
                ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.com https://*.clerk.accounts.dev https://clerk.editordetexto.online https://accounts.editordetexto.online https://*.clerk.services https://vercel.live https://*.vercel-scripts.com https://www.googletagmanager.com https://*.clarity.ms https://challenges.cloudflare.com https://static.cloudflareinsights.com; connect-src 'self' https://clerk.com https://*.clerk.accounts.dev https://clerk.editordetexto.online https://accounts.editordetexto.online https://*.clerk.services https://clerk-telemetry.com https://api.stripe.com https://api.openai.com https://languagetool.editordetexto.cloud https://api.editordetexto.cloud https://res.cloudinary.com https://vitals.vercel-analytics.com https://*.clarity.ms https://www.google-analytics.com https://challenges.cloudflare.com https://cloudflareinsights.com; img-src * data: blob:; worker-src 'self' blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-src 'self' blob: https://*.clerk.accounts.dev https://clerk.editordetexto.online https://accounts.editordetexto.online https://*.clerk.services https://vercel.live https://challenges.cloudflare.com; object-src 'self' blob:;"
                : "default-src 'self'; script-src 'self' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://clerk.editordetexto.online https://accounts.editordetexto.online https://*.clerk.services https://vercel.live https://*.vercel-scripts.com https://www.googletagmanager.com https://*.clarity.ms https://challenges.cloudflare.com https://static.cloudflareinsights.com; connect-src 'self' https://clerk.com https://*.clerk.accounts.dev https://clerk.editordetexto.online https://accounts.editordetexto.online https://*.clerk.services https://clerk-telemetry.com https://api.stripe.com https://api.openai.com https://languagetool.editordetexto.cloud https://api.editordetexto.cloud https://res.cloudinary.com https://vitals.vercel-analytics.com https://*.clarity.ms https://www.google-analytics.com https://challenges.cloudflare.com https://cloudflareinsights.com; img-src * data: blob:; worker-src 'self' blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-src 'self' blob: https://*.clerk.accounts.dev https://clerk.editordetexto.online https://accounts.editordetexto.online https://*.clerk.services https://vercel.live https://challenges.cloudflare.com; object-src 'self' blob:;",
            // SEG-06: 'unsafe-inline' em script-src é mantido para suportar Clerk,
            // Injeção de Schemas SEO (LD+JSON) e GTM/Clarity sem Nonces complexos.
            // 'unsafe-eval' é permitido apenas em desenvolvimento para suportar source maps.
          },
        ],
      },
      {
        source: "/:all*(svg|jpg|jpeg|png|gif|ico|webp|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};
import { withSentryConfig } from "@sentry/nextjs";

export default withSentryConfig(nextConfig, {
  org: "editordetexto",
  project: "javascript-nextjs",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  autoInstrumentMiddleware: false,
});
