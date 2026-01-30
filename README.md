# AI 周报站点

本项目实现了一个用于发布每周 AI 高价值解读的静态网站，使用 Next.js + MDX 构建。项目包含内容与代码分离的结构，便于后续每周持续追加新内容。

## 快速开始

1. **安装依赖**

   本仓库未包含 `node_modules`，您需要在本地安装依赖。请确保安装了 Node.js（18+），进入 `website` 目录并执行：

   ```bash
   cd website
   npm install
   ```

2. **开发运行**

   开发模式下启动本地服务器：

   ```bash
   npm run dev
   ```

   浏览器访问 <http://localhost:3000> 即可查看网站。

3. **构建与导出静态文件**

   生成并导出静态站点：

   ```bash
   npm run build
   # 导出的静态文件位于 website/out
   ```

   生成后可直接通过静态文件托管或本地打开 `out/index.html` 浏览。

## 目录结构

```
ai-weekly/
├── content/               # 存放每条新闻和每周周报的 MDX 内容（不包含布局代码）
│   ├── items/             # 每条入选内容对应一个 MDX 文件
│   └── weeks/             # 每周周报 MDX 文件
├── website/               # Next.js 应用代码
│   ├── pages/             # 页面文件，包括动态路由
│   ├── components/        # 复用的 React 组件
│   ├── lib/               # 内容读取工具
│   ├── styles/            # 全局样式
│   ├── public/            # 静态资源
│   ├── package.json       # 项目依赖与脚本
│   └── next.config.mjs    # Next.js 配置，启用 MDX
└── README.md             # 使用说明（当前文件）
```

### 内容格式

每条内容文件遵循 `content/items/<slug>.mdx`，包含 YAML Frontmatter 和正文。Frontmatter 示例：

```mdx
---
title: 示例标题 (Example Title)
slug: 2026-01-26-example
createdAt: 2026-01-26
updatedAt: 2026-01-26
sourceDates:
  - 2026-01-26
tags:
  - 工具链
evidence: A
score: 9.2
---

## 一句话结论
……

## 发生了什么
……
```

周报文件位于 `content/weeks`，Frontmatter 包含 `weekStart` 和 `weekEnd`，正文包含 `TL;DR`、入选列表、行动建议等。

### 更新流程（下周如何追加内容）

1. **准备内容**：按照本仓库现有条目的格式，在 `content/items/` 新增新的 `.mdx` 文件，并在 `content/weeks/` 创建新的周报 `.mdx` 文件。注意：不要删除历史文件，只需要新增。
2. **运行构建**：在 `website` 目录运行 `npm run build`，Next.js 会自动扫描新的内容并生成更新后的静态站点。
3. **检查效果**：构建完成后，打开 `website/out/index.html` 即可查看最新周报与条目。

### 常见问题

- **如何调整排序？**  每个条目 Frontmatter 中的 `score` 将用于首页和周报列表的排序，分值越高越靠前。
- **搜索如何工作？**  搜索页面通过客户端 JavaScript 读取预构建的条目列表，在浏览器中进行过滤，不会发送请求到服务器。
- **支持暗色模式吗？**  是的，样式使用 CSS 变量，根据系统 `prefers-color-scheme` 自动切换浅色/深色模式。

如有疑问，请查看源码了解具体实现细节。