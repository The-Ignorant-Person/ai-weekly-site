/** @type {import('next').NextConfig} */
const repo = 'ai-weekly-site'
const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  trailingSlash: true,
  output: "export",
  images: { unoptimized: true },

  // GitHub Pages project site 必需
  basePath: isProd ? `/${repo}` : '',
  assetPrefix: isProd ? `/${repo}/` : '',
};

export default nextConfig;
