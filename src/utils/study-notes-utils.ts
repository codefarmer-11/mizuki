import fs from "node:fs";
import path from "node:path";

const STUDY_NOTES_POSTS_DIR = path.join(
	process.cwd(),
	"src/content/posts/studyNotes",
);

/**
 * 列出 `src/content/posts/studyNotes/` 下的一级子文件夹名（即分类 slug）
 */
export function getStudyNotesCategorySlugs(): string[] {
	if (!fs.existsSync(STUDY_NOTES_POSTS_DIR)) {
		return [];
	}
	return fs
		.readdirSync(STUDY_NOTES_POSTS_DIR, { withFileTypes: true })
		.filter((d) => d.isDirectory())
		.filter((d) => !d.name.startsWith("."))
		.map((d) => d.name)
		.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

/**
 * 将地址栏里的分类段解析为磁盘上的真实文件夹名（大小写一致）。
 * 在区分大小写的服务器上，/studyNotes/linux/ 与 /studyNotes/Linux/ 是不同的路径；
 * 若 param 与某一文件夹仅大小写不同，则返回该文件夹名以便 301 到规范 URL。
 */
export function resolveStudyNotesCategorySlug(
	param: string | undefined,
	slugs: string[],
): string | null {
	if (!param) {
		return null;
	}
	if (slugs.includes(param)) {
		return param;
	}
	const lower = param.toLowerCase();
	const match = slugs.find((s) => s.toLowerCase() === lower);
	return match ?? null;
}

/**
 * 供 `studyNotes/[category]` 的 getStaticPaths 使用：每个真实文件夹一条路径；
 * 若某文件夹名不是全小写，且不存在另一个仅大小写不同的同名文件夹，则额外生成全小写
 * 路径（构建出的页面会 301 到规范文件夹名），避免静态托管上「小写链接」直接 404。
 */
export function getStudyNotesCategoryPathParams(): string[] {
	const slugs = getStudyNotesCategorySlugs();
	const byLower = new Map<string, string[]>();
	for (const s of slugs) {
		const k = s.toLowerCase();
		if (!byLower.has(k)) {
			byLower.set(k, []);
		}
		byLower.get(k)!.push(s);
	}
	const params = new Set<string>(slugs);
	for (const [lowerKey, originals] of byLower) {
		if (originals.length === 1) {
			const [canonical] = originals;
			if (canonical !== lowerKey) {
				params.add(lowerKey);
			}
		}
	}
	return [...params];
}
