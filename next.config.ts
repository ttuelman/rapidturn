import type { NextConfig } from "next";

/**
 * GitHub project Pages serves this app at `/<repo>` (https://ttuelman.github.io/rapidturn/).
 * The Pages workflow sets GITHUB_PAGES=true and BASE_PATH=/rapidturn.
 * Local `npm run dev` and `npm start` leave both unset, so the dev server stays at `/`.
 */
const basePath = (process.env.BASE_PATH ?? "").replace(/\/$/, "");
const githubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  transpilePackages: ["three"],
  ...(basePath ? { basePath } : {}),
  ...(githubPages
    ? {
        output: "export" as const,
        trailingSlash: true,
      }
    : {}),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
