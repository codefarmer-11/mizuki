# Mizuki

基于 [Astro](https://astro.build/) 的静态个人站点主题：文章与手记、归档、RSS/Atom、搜索（Pagefind）、Swup 无刷新导航、Tailwind CSS、Svelte 5 组件与丰富的可选功能页（番剧、相册、时间线、资源等）。默认输出 **纯静态 HTML**，便于部署到任意静态托管。

- **包管理**：仅支持 [pnpm](https://pnpm.io/)（`packageManager` 与 `preinstall` 已约束）。
- **内容**：文章位于 `posts` 集合（本地为 `src/content/posts/`，也可通过环境变量从独立内容仓库同步）。
- **站点信息**：标题、域名、导航与功能开关等在 `src/config.ts` 的 `siteConfig` / `navBarConfig` 等处修改。

---

## 技术栈（摘要）

| 类别 | 主要依赖 |
|------|-----------|
| 框架 | Astro 6、TypeScript |
| UI | Svelte 5、Tailwind CSS 4、astro-icon |
| 内容 | MD/MDX、Expressive Code、KaTeX、Mermaid（见 `astro.config.mjs`） |
| 搜索 | Pagefind（`pnpm build` 末尾对 `dist` 索引） |
| 路由增强 | @swup/astro |

---

## 快速开始

```bash
pnpm install
```

复制环境变量示例并按需填写：

```bash
cp .env.example .env
```

常用命令：

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 本地开发（`predev` 会尝试执行内容同步脚本，失败不阻断） |
| `pnpm build` | 生产构建：番剧数据脚本（若启用）→ `astro build` → Pagefind → 字体压缩 |
| `pnpm preview` | 本地预览构建产物 |
| `pnpm check` | `astro check`（类型与 Astro 诊断） |
| `pnpm sync-content` | 按 `.env` 从独立仓库同步 `posts` / `spec` / `images` 等到本项目 |
| `pnpm new-post` | 辅助创建新文章（见 `scripts/new-post.js`） |

---

## 内容与目录

### 单仓库（文章直接写在主题仓库）

- 文章：`src/content/posts/**/*.md(x)`
- 规范说明：**[docs/article-format.md](./docs/article-format.md)**（frontmatter、手记目录 `cookbook` / `essay` / `studyNotes/<分类>/` 等）

### 内容分离（推荐与主题分仓）

1. 在 `.env` 中设置 `ENABLE_CONTENT_SYNC=true` 与 `CONTENT_REPO_URL`（详见 `.env.example`）。
2. 内容仓库根目录下提供 `posts/`、`spec/`、`images/` 等映射（与 `scripts/sync-content.js` 中 `contentMappings` 一致）。

构建前会通过 `prebuild` / `predev` 执行 `sync-content`（可用 `ENABLE_CONTENT_SYNC=false` 关闭，仅用本地 `src/content`）。

---

## 仓库结构（节选）

```
src/
  config.ts              # 站点与功能总配置
  content.config.ts      # posts / spec 集合与 Zod schema
  content/posts/         # 默认文章根（可被同步覆盖）
  pages/                 # 路由与页面
  components/            # Astro / Svelte 组件
  layouts/               # 布局
  i18n/                  # 多语言文案
scripts/                 # 同步内容、新文章、番剧/字体等工具
public/                  # 静态资源
docs/                    # 项目内文档（文章格式等）
```

---

## 构建与检查

- **CI 建议**：至少运行 `pnpm check`（即 `astro check`）。
- **生产构建**：`pnpm build` 依赖 Node 环境；若使用 B 站番剧进度等，请按 `.env.example` 配置密钥，且勿将密钥写入仓库。

---

## 许可

仓库根目录同时包含 **`LICENSE`**（Apache License 2.0）与 **`LICENSE.MIT`**（MIT）。使用前请阅读并遵守你实际选择适用的条款及其中版权声明。

---

## 相关链接

- 文章与手记格式：[docs/article-format.md](./docs/article-format.md)
- Astro 文档：<https://docs.astro.build/>
