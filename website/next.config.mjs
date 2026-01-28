const repo = "ai-weekly-site";

export default {
  output: "export",
  trailingSlash: true,

  // 关键：GitHub Pages 项目站点必须有 basePath
  basePath: `/${repo}`,
  assetPrefix: `/${repo}/`,

  images: { unoptimized: true },
};
