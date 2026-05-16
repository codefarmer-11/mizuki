<script lang="ts">
	import I18nKey from "@i18n/i18nKey";
	import { i18n } from "@i18n/translation";
	import { getSectionTagUrl, getTagUrl } from "@utils/url-utils";
	import { onMount } from "svelte";

	export let tags: string[];
	export let categories: string[];
	export let sortedPosts: Post[] = [];
	/**
	 * 为 true 时根据地址栏 ?tag= / ?category= 过滤（归档页行为）。
	 */
	export let applyUrlQueryFilters = true;
	/**
	 * 手记分区路径（如 /cookbook/）。启用分区 ?tag= 筛选，
	 * 且仅接受当前列表内存在的 tag，避免从归档页带参跳转时列表被清空。
	 */
	export let filterBasePath: string | undefined = undefined;

	interface Post {
		id: string;
		url?: string;
		data: {
			title: string;
			tags: string[];
			category?: string;
			published: Date | string;
			alias?: string;
			permalink?: string;
		};
	}

	interface Group {
		year: number;
		posts: Post[];
	}

	let groups: Group[] = [];

	$: useUrlFilters = applyUrlQueryFilters || !!filterBasePath;

	function toPublishedDate(published: Date | string): Date {
		if (published instanceof Date) {
			return published;
		}
		return new Date(published);
	}

	function formatDate(date: Date) {
		const month = (date.getMonth() + 1).toString().padStart(2, "0");
		const day = date.getDate().toString().padStart(2, "0");
		return `${month}-${day}`;
	}

	function formatTag(tagList: string[]) {
		return tagList.map((t) => `#${t}`).join(" ");
	}

	function sanitizeSearchParams(
		searchParams: URLSearchParams,
	): URLSearchParams {
		if (!filterBasePath) {
			return searchParams;
		}
		const next = new URLSearchParams();
		for (const tag of searchParams.getAll("tag")) {
			if (tags.includes(tag)) {
				next.append("tag", tag);
			}
		}
		return next;
	}

	function buildArchiveGroups(
		postsInput: Post[],
		searchParams: URLSearchParams,
		useUrlFilterMode: boolean,
	): Group[] {
		const normalized: Post[] = postsInput.map((post) => ({
			...post,
			data: {
				...post.data,
				published: toPublishedDate(post.data.published),
			},
		}));

		let urlTags: string[] = [];
		let urlCategories: string[] = [];
		let uncategorized: string | null = null;
		if (useUrlFilterMode) {
			const scopedParams = sanitizeSearchParams(searchParams);
			urlTags = scopedParams.has("tag") ? scopedParams.getAll("tag") : [];
			if (!filterBasePath) {
				urlCategories = searchParams.has("category")
					? searchParams.getAll("category")
					: [];
				uncategorized = searchParams.get("uncategorized");
			}
		}

		let filteredPosts: Post[] = normalized;

		if (urlTags.length > 0) {
			filteredPosts = filteredPosts.filter(
				(post) =>
					Array.isArray(post.data.tags) &&
					post.data.tags.some((tag) => urlTags.includes(tag)),
			);
		}

		if (urlCategories.length > 0) {
			filteredPosts = filteredPosts.filter(
				(post) =>
					post.data.category &&
					urlCategories.includes(post.data.category),
			);
		}

		if (uncategorized) {
			filteredPosts = filteredPosts.filter((post) => !post.data.category);
		}

		filteredPosts = filteredPosts
			.slice()
			.sort(
				(a, b) =>
					toPublishedDate(b.data.published).getTime() -
					toPublishedDate(a.data.published).getTime(),
			);

		const grouped = filteredPosts.reduce(
			(acc, post) => {
				const year = toPublishedDate(post.data.published).getFullYear();
				if (!acc[year]) {
					acc[year] = [];
				}
				acc[year].push(post);
				return acc;
			},
			{} as Record<number, Post[]>,
		);

		const groupedPostsArray = Object.keys(grouped).map((yearStr) => ({
			year: Number.parseInt(yearStr, 10),
			posts: grouped[Number.parseInt(yearStr, 10)],
		}));

		groupedPostsArray.sort((a, b) => b.year - a.year);

		return groupedPostsArray;
	}

	function refreshGroups() {
		const params =
			typeof window !== "undefined"
				? new URLSearchParams(window.location.search)
				: new URLSearchParams();
		groups = buildArchiveGroups(sortedPosts, params, useUrlFilters);
	}

	function getRowTagHref(tag: string): string {
		const trimmed = tag.trim();
		if (filterBasePath) {
			return getSectionTagUrl(filterBasePath, trimmed);
		}
		return getTagUrl(trimmed);
	}

	function stopRowNavigation(event: MouseEvent) {
		event.stopPropagation();
	}

	$: if (!useUrlFilters) {
		groups = buildArchiveGroups(sortedPosts, new URLSearchParams(), false);
	}

	onMount(() => {
		if (useUrlFilters) {
			refreshGroups();
			document.addEventListener("astro:page-load", refreshGroups);
			document.addEventListener("swup:contentReplaced", refreshGroups);
			return () => {
				document.removeEventListener("astro:page-load", refreshGroups);
				document.removeEventListener("swup:contentReplaced", refreshGroups);
			};
		}
	});
</script>

<div class="card-base px-8 py-6">
	{#each groups as group}
		<div>
			<div class="flex flex-row w-full items-center h-[3.75rem]">
				<div
					class="w-[15%] md:w-[10%] transition text-2xl font-bold text-right text-75"
				>
					{group.year}
				</div>
				<div class="w-[15%] md:w-[10%]">
					<div
						class="h-3 w-3 bg-none rounded-full outline outline-[var(--primary)] mx-auto
                  -outline-offset-[2px] z-50 outline-3"
					></div>
				</div>
				<div class="w-[70%] md:w-[80%] transition text-left text-50">
					{group.posts.length}
					{i18n(
						group.posts.length === 1
							? I18nKey.postCount
							: I18nKey.postsCount,
					)}
				</div>
			</div>

			{#each group.posts as post}
				<a
					href={post.url || `/posts/${post.id}/`}
					aria-label={post.data.title}
					class="group btn-plain !block h-10 w-full rounded-lg hover:text-[initial]"
				>
					<div
						class="flex flex-row justify-start items-center h-full"
					>
						<div
							class="w-[15%] md:w-[10%] transition text-sm text-right text-50"
						>
							{formatDate(toPublishedDate(post.data.published))}
						</div>

						<div
							class="w-[15%] md:w-[10%] relative dash-line h-full flex items-center"
						>
							<div
								class="transition-all mx-auto w-1 h-1 rounded group-hover:h-5
                       bg-[oklch(0.5_0.05_var(--hue))] group-hover:bg-[var(--primary)]
                       outline outline-4 z-50
                       outline-[var(--card-bg)]
                       group-hover:outline-[var(--btn-plain-bg-hover)]
                       group-active:outline-[var(--btn-plain-bg-active)]"
							></div>
						</div>

						<div
							class="w-[70%] md:max-w-[65%] md:w-[65%] text-left font-bold
                     group-hover:translate-x-1 transition-all group-hover:text-[var(--primary)]
                     text-75 pr-8 whitespace-nowrap overflow-ellipsis overflow-hidden"
						>
							{post.data.title}
						</div>

						<div
							class="hidden md:flex md:w-[15%] text-left text-sm transition
                     flex-wrap gap-x-1.5 gap-y-0.5 text-30"
						>
							{#if filterBasePath && post.data.tags?.length}
								{#each post.data.tags as tag}
									<a
										href={getRowTagHref(tag)}
										class="hover:text-[var(--primary)] whitespace-nowrap"
										aria-label={`View posts tagged with ${tag.trim()}`}
										on:click={stopRowNavigation}
									>
										#{tag.trim()}
									</a>
								{/each}
							{:else}
								<span
									class="whitespace-nowrap overflow-ellipsis overflow-hidden"
								>
									{formatTag(post.data.tags)}
								</span>
							{/if}
						</div>
					</div>
				</a>
			{/each}
		</div>
	{/each}
</div>
