import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
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
        source: "/sobre",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/es/sobre",
        destination: "/es/about",
        permanent: true,
      },
      {
        source: "/contato",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/es/contato",
        destination: "/es/contact",
        permanent: true,
      },
      {
        source: "/privacidade",
        destination: "/privacy",
        permanent: true,
      },
      {
        source: "/es/privacidade",
        destination: "/es/privacy",
        permanent: true,
      },
      {
        source: "/termos",
        destination: "/terms",
        permanent: true,
      },
      {
        source: "/es/termos",
        destination: "/es/terms",
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
            value: "on"
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload"
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN"
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin"
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.com https://*.clerk.accounts.dev https://vercel.live https://*.vercel-scripts.com https://www.googletagmanager.com https://*.clarity.ms; connect-src 'self' https://clerk.com https://*.clerk.accounts.dev https://clerk-telemetry.com https://api.stripe.com https://api.openai.com https://languagetool.editordetexto.cloud https://api.editordetexto.cloud https://res.cloudinary.com https://vitals.vercel-analytics.com https://*.clarity.ms https://www.google-analytics.com; img-src 'self' data: https://res.cloudinary.com https://images.unsplash.com https://img.clerk.com https://www.googletagmanager.com https://www.google-analytics.com https://*.clarity.ms; worker-src 'self' blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-src 'self' https://*.clerk.accounts.dev https://vercel.live;"
          }
        ]
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
  reactComponentAnnotation: { enabled: true },
  tunnelRoute: "/monitoring",
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
});
