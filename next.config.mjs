/** @type {import('next').NextConfig} */

const repo = 'ai-weekly-site';
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  trailingSlash: true,
  output: 'export',
  images: { unoptimized: true },

  // 关键：GitHub Pages 项目站点需要子路径
  basePath: isProd ? `/${repo}` : '',
  assetPrefix: isProd ? `/${repo}/` : '',
};

export default nextConfig;
