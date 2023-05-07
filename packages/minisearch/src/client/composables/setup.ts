import { type InjectionKey, type Ref, provide, ref } from "vue";

declare const __VUEPRESS_DEV__: boolean;

export const minisearchModalSymbol: InjectionKey<Ref<boolean>> = Symbol(
  __VUEPRESS_DEV__ ? "minisearch-modal" : ""
);

export const setupSearchModal = (): void => {
  const isActive = ref(false);

  provide(minisearchModalSymbol, isActive);
};
