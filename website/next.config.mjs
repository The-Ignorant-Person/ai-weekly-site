const repo =
  process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "ai-weekly-site";
const isProd = process.env.NODE_ENV === "production";

export default {
  output: "export",
  trailingSlash: true,

  // 关键：GitHub Pages 项目站点必须有 basePath
  basePath: isProd ? `/${repo}` : "",
  assetPrefix: isProd ? `/${repo}/` : "",

  images: { unoptimized: true },
};
