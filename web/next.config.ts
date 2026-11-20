import path from "node:path";
import type { NextConfig } from "next";

// The workspace root holds the lockfile, data/ and docs/. Naming it stops Next from guessing.
const workspaceRoot = path.join(import.meta.dirname, "..");

const CSP = [
  "default-src 'self'",
  // Next's inline bootstrap and the theme script run inline.
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: { root: workspaceRoot },
  outputFileTracingRoot: workspaceRoot,
  // The model and the figures are TypeScript sources in the workspace.
  transpilePackages: ["@phosphoros/calc", "@phosphoros/figures"],
  // data/ and docs/ are read at build time; trace them so every page can.
  outputFileTracingIncludes: { "/**": ["../data/**", "../docs/**", "../calc/src/**"] },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
