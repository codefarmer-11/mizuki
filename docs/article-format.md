# Mizuki 文章格式与存放说明

本文说明 **posts 集合**（`src/content/posts/` 下，或内容分离仓库里的 `posts/`）中 Markdown / MDX 的 **frontmatter 必填项、常用可选项**，以及 **手记三栏（Cookbook / Essay / Study Notes）** 的目录约定。字段以项目内 `src/content.config.ts` 的 Zod 校验为准。

---

## 一、文件放在哪里

### 单仓库（内容写在主题仓库里）

- 根路径：**`src/content/posts/`**
- 支持任意子目录，扩展名：**`.md`** 或 **`.mdx`**

### 内容分离（Mizuki-Content 等）

同步后等价于上面的目录，你在内容仓库里应使用：

| 用途 | 内容仓库路径（相对仓库根） |
|------|---------------------------|
| 普通文章、归档、首页列表等 | `posts/**`（不要和下面手记目录混用同一套规则时搞错层级即可） |
| Cookbook 手记 | `posts/cookbook/**` |
| Essay 随笔 | `posts/essay/**` |
| 学习笔记（先分类文件夹，再文章） | `posts/studyNotes/<分类名>/**` |

**学习笔记**：`<分类名>` 必须与 `posts/studyNotes/` 下**一级文件夹名**一致（如 `c`、`qt`、`c++`）。该分类下列出的文章，其文件路径必须满足：

`posts/studyNotes/<分类名>/某文章.md`  
或  
`posts/studyNotes/<分类名>/某目录/index.md`

> 随笔目录名请使用 **`essay`**（不要用 `essey`），否则 `/essay/` 页面读不到。

---

## 二、Frontmatter 基本结构（必填 + 常用）

每篇文章顶部用 `---` 包裹 YAML，例如：

```yaml
---
title: 文章标题
published: 2024-06-01
description: 列表页与 SEO 用的短描述
tags: [标签甲, 标签乙]
category: 可选分类名
draft: false
---
```

### 必填

| 字段 | 类型 | 说明 |
|------|------|------|
| `title` | 字符串 | 标题 |
| `published` | 日期 | 发布日期。建议 `YYYY-MM-DD`；也可写带时间的 ISO 字符串，需能被解析为日期 |

### 强烈建议填写

| 字段 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `description` | 字符串 | `""` | 摘要，用于列表与 meta |
| `tags` | 字符串数组 | `[]` | 标签 |
| `draft` | 布尔 | `false` | **`true` 时生产构建（`pnpm build`）不会收录该文**，本地开发仍可见 |

### 常用可选

| 字段 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `updated` | 日期 | 无 | 上次更新时间 |
| `image` | 字符串 | `""` | 封面：`http(s)://...`、`/从 public 起的路径`，或相对当前 md 的路径（如 `./cover.webp`） |
| `category` | 字符串或空 | `""` | **归档页、分类条**等会用到；与「学习笔记文件夹名」无关，不要混用 |
| `lang` | 字符串 | `""` | 语言标记，如 `zh-CN` |
| `pinned` | 布尔 | `false` | 置顶 |
| `priority` | 数字 | 无 | 置顶时的排序，**数值越小越靠前** |
| `comment` | 布尔 | `true` | 是否开启评论 |
| `author` | 字符串 | `""` | 作者 |
| `sourceLink` | 字符串 | `""` | 转载或原文链接 |
| `licenseName` / `licenseUrl` | 字符串 | `""` | 许可证名称与链接 |

### 加密文章（可选）

```yaml
encrypted: true
password: "你的密码"
passwordHint: "可选提示"
```

### 自定义地址（可选）

- `alias`：自定义 slug（在默认 `/posts/...` 规则下使用）  
- `permalink`：自定义完整路径（若主题开启 permalink 策略时优先级更高，见主题文档）

`prevTitle` / `prevSlug` / `nextTitle` / `nextSlug` 由构建逻辑填充，**一般不要在 frontmatter 里手写**。

---

## 三、完整示例

### 1）单文件文章

`posts/my-note.md`：

```yaml
---
title: 我的笔记
published: 2025-01-15
description: 一句话说明
tags: [笔记, Mizuki]
category: 随记
draft: false
---

正文从这里开始。
```

### 2）文章 + 同目录资源（推荐大图/多图）

`posts/my-project/index.md`：

```yaml
---
title: 项目说明
published: 2025-02-01
image: "./cover.png"
tags: [项目]
draft: false
---

![示意](./screenshot.png)
```

### 3）Cookbook

`posts/cookbook/tomato-soup.md`：同上，**只要路径在 `posts/cookbook/` 下** 且 frontmatter 合法即可。

### 4）Essay

`posts/essay/2025-spring.md`：路径在 **`posts/essay/`** 下。

### 5）学习笔记某一分类

`posts/studyNotes/c/pointers.md`：

```yaml
---
title: C 指针备忘
published: 2025-03-01
description: 指针与数组
tags: [C, 笔记]
draft: false
---

内容……
```

同时仓库里需存在目录 **`posts/studyNotes/c/`**（与分类页 slug 一致）。

---

## 四、常见问题

1. **生产环境看不到文章**  
   检查是否 `draft: true`，或 frontmatter 日期/字段错误导致 **Zod 校验失败**（构建会报错或跳过该文件）。

2. **学习笔记分类页空白**  
   确认文章路径是否为 `studyNotes/<分类文件夹名>/...`；分类名与文件夹名大小写一致（Linux 区分大小写）。

3. **`category` 与笔记文件夹**  
   `category` 只影响归档/分类条等；**不等于** `studyNotes` 下的文件夹名。

4. **日期格式**  
   推荐 `published: 2024-04-01`；乱写字符串会导致解析失败。

---

## 五、与代码的对应关系

- 校验规则：`src/content.config.ts` 中 `posts` 集合的 `schema`  
- 手记路由与过滤：`src/pages/cookbook.astro`、`essay.astro`、`studyNotes.astro`、`studyNotes/[category].astro`  
- 工具函数：`src/utils/content-utils.ts`（按文章 `id` 前缀过滤目录）

若你升级主题版本，请以仓库内最新的 `content.config.ts` 为准核对字段。
