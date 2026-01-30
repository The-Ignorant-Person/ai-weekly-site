const repo = process.env.NEXT_PUBLIC_REPO || process.env.REPO_NAME || "ai-weekly-site";
const isProd = process.env.NODE_ENV === "production";
const basePath = isProd && repo ? `/${repo}` : "";

export default {
  output: "export",
  trailingSlash: true,

  // GitHub Pages 项目站点需要 basePath；开发环境保持根路径
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,

  images: { unoptimized: true },
};
