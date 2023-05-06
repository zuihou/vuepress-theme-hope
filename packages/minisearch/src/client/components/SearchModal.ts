import {
  layoutsSymbol,
  pageFrontmatterSymbol,
  pageHeadSymbol,
  pageHeadTitleSymbol,
  pageLangSymbol,
  pageLayoutSymbol,
  useLayouts,
  usePageFrontmatter,
  usePageHead,
  usePageHeadTitle,
  usePageLang,
  usePageLayout,
  useRouteLocale,
} from "@vuepress/client";
import {
  computedAsync,
  debouncedWatch,
  onKeyStroke,
  useEventListener,
  useLocalStorage,
  useScrollLock,
  useSessionStorage,
} from "@vueuse/core";
import Mark from "mark.js/src/vanilla.js";
import Minisearch, { type SearchResult } from "minisearch";
import {
  type ComponentOptions,
  type Ref,
  type VNode,
  createApp,
  defineComponent,
  h,
  markRaw,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
} from "vue";
import { useRouter } from "vue-router";
import { useLocaleConfig } from "vuepress-shared/client";

// TODO: Add hmr
import { pagesComponents } from "@internal/pagesComponents";
import searchIndex from "@temp/minisearch/index";

import { enableQueryHistory, minisearchLocales } from "../define.js";

import "../styles/search-modal.scss";

interface IndexResult {
  title: string;
  titles: string[];
  text?: string;
}

const BACK_ICON =
  '<svg width="18" height="18" aria-hidden="true" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5m7 7-7-7 7-7"/></svg>';
const LAYOUT_ICON =
  '<svg width="18" height="18" aria-hidden="true" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 14h7v7H3zM3 3h7v7H3zm11 1h7m-7 5h7m-7 6h7m-7 5h7"/></svg>';

const CLEAR_ICON =
  '<svg width="18" height="18" aria-hidden="true" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm-2 4-6 6m0-6 6 6"/></svg>';

const UP_ICON =
  '<svg width="14" height="14" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19V5m-7 7 7-7 7 7"/></svg>';

const DOWN_ICON =
  '<svg width="14" height="14" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14m7-7-7 7-7-7"/></svg>';

const ENTER_ICON =
  '<svg width="14" height="14" viewBox="0 0 24 24"><g fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="m9 10-5 5 5 5"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/></g></svg>';

const HEADING_REGEXP = /<h(\d*).*?>.*?<a.*? href="#(.*?)".*?>.*?<\/a><\/h\1>/gi;

const formMarkRegex = (terms: Set<string>): RegExp =>
  new RegExp(
    [...terms]
      .sort((a, b) => b.length - a.length)
      .map((term) => {
        return `(${term
          .replace(/[|\\{}()[\]^$+*?.]/g, "\\$&")
          .replace(/-/g, "\\x2d")})`;
      })
      .join("|"),
    "gi"
  );

const getComponent = (id: string): ComponentOptions => {
  try {
    return pagesComponents[id];
  } catch (err) {
    console.error(err);

    return { render: () => null };
  }
};

export default defineComponent({
  name: "SearchModal",

  emits: ["close"],

  setup(_props, { emit }) {
    const layouts = useLayouts();
    const frontmatter = usePageFrontmatter();
    const head = usePageHead();
    const title = usePageHeadTitle();
    const lang = usePageLang();
    const routeLocale = useRouteLocale();
    const layout = usePageLayout();
    const locale = useLocaleConfig(minisearchLocales);

    const el = shallowRef<HTMLElement>();
    const resultsElement = shallowRef<HTMLElement>();

    const filterText = enableQueryHistory
      ? useSessionStorage("MINI_SEARCH_FILTER", "")
      : ref("");

    const showDetailedList = useLocalStorage(
      "MINI_SEARCH_DETAILED_LIST",
      false
    );

    /* Search */

    const searchIndexData = computedAsync(async () => {
      const localeIndex = (await searchIndex[routeLocale.value]?.())?.default;

      console.log(localeIndex);
      console.log(
        Minisearch.loadJSON<IndexResult & { id: string }>(localeIndex, {
          fields: ["title", "titles", "text"],
          storeFields: ["title", "titles"],
          searchOptions: {
            fuzzy: 0.2,
            prefix: true,
            boost: { title: 4, text: 2, titles: 1 },
          },
        })
      );

      return markRaw(
        Minisearch.loadJSON<IndexResult & { id: string }>(localeIndex, {
          fields: ["title", "titles", "text"],
          storeFields: ["title", "titles"],
          searchOptions: {
            fuzzy: 0.2,
            prefix: true,
            boost: { title: 4, text: 2, titles: 1 },
          },
        })
      );
    });

    const results: Ref<
      (Omit<SearchResult, "id"> & IndexResult & { id: string })[]
    > = shallowRef([]);

    const enableNoResults = ref(false);

    watch(filterText, () => {
      console.log(filterText.value);
      enableNoResults.value = false;
    });

    // eslint-disable-next-line @typescript-eslint/require-await
    const mark = computedAsync(async () => {
      if (!resultsElement.value) return;

      return markRaw(new Mark(resultsElement.value));
    }, null);

    debouncedWatch(
      () =>
        [
          searchIndexData.value,
          filterText.value,
          showDetailedList.value,
        ] as const,
      async (
        [index, filterTextValue, showDetailedListValue],
        _old,
        onCleanup
      ) => {
        let canceled = false;

        console.log(index);

        onCleanup(() => {
          canceled = true;
        });

        if (!index) return;

        // Search
        results.value = index
          .search(filterTextValue)
          .slice(0, 16) as (SearchResult & IndexResult)[];
        enableNoResults.value = true;

        // TODO: Remove
        console.log(filterTextValue, results.value);

        // Highlighting
        const componentsData = showDetailedListValue
          ? results.value.map(({ id }) => ({
              id,
              component: getComponent(id),
            }))
          : [];

        if (canceled) return;

        const c = new Map<string, Map<string, string>>();

        for (const { id, component } of componentsData) {
          const app = createApp(component);

          // Silence warnings  about missing components
          app.config.warnHandler = (): void => {
            // do nothing
          };

          app.provide(layoutsSymbol, layouts);
          app.provide(pageFrontmatterSymbol, frontmatter);
          app.provide(pageHeadSymbol, head);
          app.provide(pageHeadTitleSymbol, title);
          app.provide(pageLangSymbol, lang);
          app.provide(pageLayoutSymbol, layout);

          const div = document.createElement("div");

          app.mount(div);

          const sections = div.innerHTML.split(HEADING_REGEXP);

          app.unmount();

          sections.shift();

          let map = c.get(id);

          if (!map) {
            map = new Map();
            c.set(id, map);
          }

          for (let i = 0; i < sections.length; i += 3) {
            const anchor = sections[i + 1];
            const html = sections[i + 2];

            map.set(anchor, html);
          }

          if (canceled) return;
        }

        const terms = new Set<string>();

        results.value = results.value.map((result) => {
          const [id, anchor] = result.id.split("#");
          const map = c.get(id);
          const text = map?.get(anchor) ?? "";

          for (const term in result["match"]) terms.add(term);

          return { ...result, text };
        });

        await nextTick();

        if (canceled) return;

        await new Promise((r) => {
          mark.value?.unmark({
            done: () => {
              mark.value?.markRegExp(formMarkRegex(terms), { done: r });
            },
          });
        });

        const excerpts: HTMLElement[] = Array.from(
          el.value?.querySelectorAll(".result .excerpt") ?? []
        );

        for (const excerpt of excerpts)
          excerpt
            .querySelector('mark[data-markjs="true"]')
            ?.scrollIntoView({ block: "center" });

        // FIXME: without this whole page scrolls to the bottom
        resultsElement.value?.firstElementChild?.scrollIntoView({
          block: "start",
        });
      },
      { debounce: 200, immediate: true }
    );

    /* Search input focus */

    const searchInput = ref<HTMLInputElement>();

    const focusSearchInput = (): void => {
      searchInput.value?.focus();
      searchInput.value?.select();
    };

    onMounted(() => {
      focusSearchInput();
    });

    const onSearchBarClick = ({ pointerType }: PointerEvent): void => {
      if (pointerType === "mouse") focusSearchInput();
    };

    /* Search keyboard selection */

    const selectedIndex = ref(0);
    const disableMouseOver = ref(false);

    const scrollToSelectedResult = (): Promise<void> =>
      nextTick().then(() => {
        const selectedElement = document.querySelector(".result.selected");

        selectedElement?.scrollIntoView({
          block: "nearest",
        });
      });

    watch(results, () => {
      selectedIndex.value = 0;
      void scrollToSelectedResult();
    });

    onKeyStroke("ArrowUp", (event) => {
      event.preventDefault();

      selectedIndex.value--;
      if (selectedIndex.value < 0)
        selectedIndex.value = results.value.length - 1;

      disableMouseOver.value = true;

      void scrollToSelectedResult();
    });

    onKeyStroke("ArrowDown", (event) => {
      event.preventDefault();
      selectedIndex.value++;

      if (selectedIndex.value >= results.value.length) selectedIndex.value = 0;

      disableMouseOver.value = true;
      void scrollToSelectedResult();
    });

    const router = useRouter();

    onKeyStroke("Enter", () => {
      const selectedPackage = results.value[selectedIndex.value];

      if (selectedPackage) {
        void router.push(selectedPackage.id);
        emit("close");
      }
    });

    onKeyStroke("Escape", () => {
      emit("close");
    });

    // Back
    useEventListener("popstate", (event) => {
      event.preventDefault();
      emit("close");
    });

    onMounted(() => {
      /** Lock body */
      const isLocked = useScrollLock(document.body);

      void nextTick().then(() => {
        isLocked.value = true;
      });

      onBeforeUnmount(() => {
        isLocked.value = false;
      });

      // Prevents going to previous site
      window.history.pushState(null, "", null);
    });

    return (): VNode =>
      h("div", { ref: el, class: "VPLocalSearchBox", "aria-modal": "true" }, [
        h("div", { class: "backdrop", onClick: () => emit("close") }),
        h("div", { class: "shell" }, [
          h("div", { class: "search-bar", onPointerUp: onSearchBarClick }, [
            h(
              "div",
              { class: "search-actions before" },
              h("button", {
                class: "back-button",
                title: locale.value.back,
                onClick: () => emit("close"),
                innerHTML: BACK_ICON,
              })
            ),
            h("input", {
              ref: searchInput,
              class: "search-input",
              placeholder: locale.value.placeholder,
              value: filterText.value,
              onInput: (event: InputEvent) => {
                filterText.value = (event.target as HTMLInputElement).value;
              },
            }),
            h("div", { class: "search-actions" }, [
              h("button", {
                class: [
                  "toggle-layout-button",
                  { "detailed-list": showDetailedList.value },
                ],
                title: locale.value.detail,
                onClick: () => {
                  showDetailedList.value = !showDetailedList.value;
                },
                innerHTML: LAYOUT_ICON,
              }),
              h("button", {
                class: "clear-button",
                title: locale.value.reset,
                onClick: () => {
                  filterText.value = "";
                },
                innerHTML: CLEAR_ICON,
              }),
            ]),
          ]),
          h(
            "div",
            {
              ref: resultsElement,
              class: "results",
              onMousemove: () => {
                disableMouseOver.value = false;
              },
            },
            [
              ...results.value.map((result, index) =>
                h(
                  "a",
                  {
                    key: result.id,
                    class: [
                      "result",
                      { selected: index === selectedIndex.value },
                    ],
                    href: result.id,
                    "aria-label": [...result.titles, result.title].join(" > "),
                    onMouseover: () => {
                      if (!disableMouseOver.value) selectedIndex.value = index;
                    },
                    onClick: () => emit("close"),
                  },
                  h("div", [
                    h("div", { class: "titles" }, [
                      h("span", { class: "title-icon" }, "#"),
                      ...result.titles.map((title, index) =>
                        h("span", { key: index, class: "title" }, [
                          h("span", { class: "text", innerHTML: title }),
                          h(
                            "svg",
                            {
                              width: 18,
                              height: 18,
                              viewBox: "0 0 18 18",
                            },
                            h("path", {
                              d: "m9 18l6-6l-6-6",
                              fill: "none",
                              stroke: "currentColor",
                              "stroke-linecap": "round",
                              "stroke-linejoin": "round",
                              "stroke-width": "2",
                            })
                          ),
                        ])
                      ),
                      h(
                        "span",
                        { class: "title main" },
                        h("span", { class: "text", innerHTML: result.title })
                      ),
                    ]),
                    showDetailedList.value
                      ? h("div", { class: "excerpt-wrapper" }, [
                          result.text
                            ? h(
                                "div",
                                { class: "excerpt" },
                                h("div", {
                                  class: "theme-hope-content",
                                  innerHTML: result.text,
                                })
                              )
                            : null,
                          h("div", { class: "excerpt-gradient-bottom" }),
                          h("div", { class: "excerpt-gradient-top" }),
                        ])
                      : null,
                  ])
                )
              ),
              filterText.value && !results.value.length && enableNoResults.value
                ? h("div", { class: "no-results" }, [
                    locale.value.noResults,
                    ' "',
                    h("strong", filterText.value),
                    '"',
                  ])
                : null,
            ]
          ),
          h("div", { class: "search-keyboard-shortcuts" }, [
            h("span", [
              h("kbd", {
                "aria-label": locale.value.upKey,
                innerHTML: UP_ICON,
              }),
              h("kbd", {
                "aria-label": locale.value.downKey,
                innerHTML: DOWN_ICON,
              }),
              locale.value.navigate,
            ]),
            h("span", [
              h("kbd", {
                "aria-label": locale.value.selectKey,
                innerHTML: ENTER_ICON,
              }),
              locale.value.select,
            ]),
            h("span", [
              h("kbd", { "aria-label": locale.value.closeKey }, "esc"),
              locale.value.close,
            ]),
          ]),
        ]),
      ]);
  },
});
