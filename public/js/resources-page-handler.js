// 资源展示页面处理脚本
// 此脚本作为全局脚本加载，不受 Swup 页面切换影响

(() => {
	console.log("[Resources Global] Script loaded");

	// 使用全局变量存储状态
	if (typeof window.resourcesPageState === "undefined") {
		window.resourcesPageState = {
			initialized: false,
			eventListeners: [],
			mutationObserver: null,
			copySuccessText: "已复制", // 默认值，会被页面覆盖
		};
	}

	// 初始化函数
	function initResourcesPage() {
		console.log("[Resources Global] initResourcesPage called");

		var searchInput = document.getElementById("resource-search");
		var resourcesGrid = document.getElementById("resources-grid");
		var noResults = document.getElementById("no-results");

		// 如果关键元素不存在，直接返回
		if (!searchInput || !resourcesGrid || !noResults) {
			return false;
		}

		var tagFilters = document.querySelectorAll(".filter-tag");
		var resourceCards = document.querySelectorAll(".resource-card");
		var copyButtons = document.querySelectorAll(".copy-link-btn");

		console.log("[Resources Global] Found elements:", {
			cards: resourceCards.length,
			filters: tagFilters.length,
			copyButtons: copyButtons.length,
		});

		// 从页面获取复制成功文本
		var copySuccessTextElement = document.getElementById(
			"resources-copy-success-text",
		);
		if (copySuccessTextElement) {
			window.resourcesPageState.copySuccessText =
				copySuccessTextElement.textContent;
		}

		// 清理旧的事件监听器
		if (window.resourcesPageState.eventListeners.length > 0) {
			console.log(
				"[Resources Global] Cleaning",
				window.resourcesPageState.eventListeners.length,
				"old listeners",
			);
			for (
				var i = 0;
				i < window.resourcesPageState.eventListeners.length;
				i++
			) {
				var listener = window.resourcesPageState.eventListeners[i];
				var element = listener[0];
				var type = listener[1];
				var handler = listener[2];
				if (element && element.removeEventListener) {
					element.removeEventListener(type, handler);
				}
			}
			window.resourcesPageState.eventListeners = [];
		}

		var currentTag = "all";
		var searchTerm = "";

		// 过滤函数
		function filterResources() {
			var visibleCount = 0;
			for (var i = 0; i < resourceCards.length; i++) {
				var card = resourceCards[i];
				var title = (card.getAttribute("data-title") || "").toLowerCase();
				var desc = (card.getAttribute("data-desc") || "").toLowerCase();
				var tags = card.getAttribute("data-tags") || "";

				var matchesSearch =
					!searchTerm ||
					title.indexOf(searchTerm) >= 0 ||
					desc.indexOf(searchTerm) >= 0;
				var matchesTag =
					currentTag === "all" || tags.split(",").indexOf(currentTag) >= 0;

				if (matchesSearch && matchesTag) {
					card.style.display = "";
					visibleCount++;
				} else {
					card.style.display = "none";
				}
			}

			if (visibleCount === 0) {
				noResults.classList.remove("hidden");
				resourcesGrid.classList.add("hidden");
			} else {
				noResults.classList.add("hidden");
				resourcesGrid.classList.remove("hidden");
			}
		}

		// 搜索功能
		var searchHandler = (e) => {
			searchTerm = e.target.value.toLowerCase();
			filterResources();
		};
		searchInput.addEventListener("input", searchHandler);
		window.resourcesPageState.eventListeners.push([
			searchInput,
			"input",
			searchHandler,
		]);

		// 标签筛选
		for (var i = 0; i < tagFilters.length; i++) {
			((button) => {
				var clickHandler = () => {
					// 更新选中状态
					for (var j = 0; j < tagFilters.length; j++) {
						var btn = tagFilters[j];
						btn.classList.remove("active");
					}
					button.classList.add("active");

					currentTag = button.getAttribute("data-tag") || "all";
					filterResources();
				};
				button.addEventListener("click", clickHandler);
				window.resourcesPageState.eventListeners.push([
					button,
					"click",
					clickHandler,
				]);
			})(tagFilters[i]);
		}

		// 复制链接功能
		for (var i = 0; i < copyButtons.length; i++) {
			((button) => {
				var clickHandler = () => {
					var url = button.getAttribute("data-url");
					if (!url) return;

					if (navigator.clipboard && navigator.clipboard.writeText) {
						navigator.clipboard
							.writeText(url)
							.then(() => {
								var originalHTML = button.innerHTML;
								button.innerHTML =
									'<div class="flex items-center gap-1"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><span class="text-xs">' +
									window.resourcesPageState.copySuccessText +
									"</span></div>";
								button.classList.add("text-green-500");
								setTimeout(() => {
									button.innerHTML = originalHTML;
									button.classList.remove("text-green-500");
								}, 2000);
							})
							.catch((err) => {
								console.error("[Resources Global] Copy failed:", err);
							});
					}
				};
				button.addEventListener("click", clickHandler);
				window.resourcesPageState.eventListeners.push([
					button,
					"click",
					clickHandler,
				]);
			})(copyButtons[i]);
		}

		window.resourcesPageState.initialized = true;
		console.log(
			"[Resources Global] ✅ Initialization complete with",
			window.resourcesPageState.eventListeners.length,
			"listeners",
		);
		return true;
	}

	// 带重试的初始化
	function tryInit(retries) {
		retries = retries || 0;
		if (initResourcesPage()) {
			console.log("[Resources Global] Init succeeded");
			return;
		}
		if (retries < 5) {
			setTimeout(() => {
				tryInit(retries + 1);
			}, 100);
		}
	}

	// MutationObserver 监听 DOM 变化
	function setupMutationObserver() {
		if (window.resourcesPageState.mutationObserver) {
			window.resourcesPageState.mutationObserver.disconnect();
		}

		window.resourcesPageState.mutationObserver = new MutationObserver(
			(mutations) => {
				var shouldInit = false;
				for (var i = 0; i < mutations.length; i++) {
					var mutation = mutations[i];
					if (mutation.addedNodes && mutation.addedNodes.length > 0) {
						for (var j = 0; j < mutation.addedNodes.length; j++) {
							var node = mutation.addedNodes[j];
							if (node.nodeType === 1) {
								if (
									node.id === "resources-grid" ||
									node.id === "resource-search" ||
									(node.querySelector &&
										node.querySelector("#resources-grid"))
								) {
									shouldInit = true;
									break;
								}
							}
						}
					}
					if (shouldInit) break;
				}

				if (shouldInit) {
					console.log("[Resources Global] DOM mutation detected");
					window.resourcesPageState.initialized = false;
					setTimeout(() => {
						tryInit();
					}, 50);
				}
			},
		);

		window.resourcesPageState.mutationObserver.observe(document.body, {
			childList: true,
			subtree: true,
		});
	}

	// 页面加载时初始化
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", () => {
			console.log("[Resources Global] DOMContentLoaded");
			tryInit();
		});
	} else {
		tryInit();
	}

	// 启动 MutationObserver
	setupMutationObserver();

	// 监听所有可能的页面切换事件
	var events = [
		"swup:contentReplaced",
		"swup:pageView",
		"astro:page-load",
		"astro:after-swap",
	];

	for (var i = 0; i < events.length; i++) {
		((eventName) => {
			document.addEventListener(eventName, () => {
				console.log("[Resources Global] Event:", eventName);
				window.resourcesPageState.initialized = false;
				setTimeout(() => {
					tryInit();
				}, 100);
			});
		})(events[i]);
	}

	console.log("[Resources Global] All listeners registered");
})();
