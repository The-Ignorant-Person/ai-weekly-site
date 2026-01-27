/** @type {import('next').NextConfig} */
const repo = "ai-weekly-site";
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },

  // GitHub Pages 子路径部署必须有
  basePath: isProd ? `/${repo}` : "",
  assetPrefix: isProd ? `/${repo}/` : "",
};

export default nextConfig;
