import { inject, provide } from "vue";
import { useBlogCategory } from "vuepress-plugin-blog2/lib/client";

import type { ComputedRef, InjectionKey } from "vue";
import type { BlogCategoryData } from "vuepress-plugin-blog2";
import type { ArticleMeta } from "../../../../shared";

export type TagMapRef = ComputedRef<BlogCategoryData<ArticleMeta>>;

export const tagMapSymbol: InjectionKey<TagMapRef> = Symbol.for("tagMap");

/**
 * Inject tagMap
 */
export const useTagMap = (): TagMapRef => {
  const tagMap = inject(tagMapSymbol);

  if (!tagMap) {
    throw new Error("useTagMap() is called without provider.");
  }

  return tagMap;
};

/**
 * Provide tagMap
 */
export const setupTagMap = (): void => {
  const tagMap = useBlogCategory<ArticleMeta>("tag");

  provide(tagMapSymbol, tagMap);
};
