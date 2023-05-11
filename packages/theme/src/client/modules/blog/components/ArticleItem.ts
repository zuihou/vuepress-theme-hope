import { withBase } from "@vuepress/client";
import {
  type PropType,
  type SlotsType,
  type VNode,
  defineComponent,
  h,
  toRef,
} from "vue";
import { RouterLink } from "vue-router";

import {
  SlideIcon,
  StickyIcon,
} from "@theme-hope/modules/blog/components/icons/index";
import { useArticleInfo } from "@theme-hope/modules/blog/composables/index";
import { LockIcon } from "@theme-hope/modules/encrypt/components/icons";
import PageInfo, {
  PageInfoProps,
} from "@theme-hope/modules/info/components/PageInfo";

import {
  type ArticleInfo,
  ArticleInfoType,
  PageType,
} from "../../../../shared/index.js";

import "../styles/article-item.scss";

export default defineComponent({
  name: "ArticleItem",

  props: {
    /**
     * Article information
     *
     * 文章信息
     */
    info: {
      type: Object as PropType<ArticleInfo>,
      required: true,
    },

    /**
     * Article path
     *
     * 文章路径
     */
    path: { type: String, required: true },
  },

  slots: Object as SlotsType<{
    cover?: (props: { cover: string | undefined }) => VNode | VNode[];
    title?: (props: {
      title: string;
      isEncrypted?: boolean;
      type: string;
    }) => VNode | VNode[];
    excerpt?: (props: { excerpt: string | undefined }) => VNode | VNode[];
    info?: (props: { info: PageInfoProps }) => VNode | VNode[];
  }>,

  setup(props, { slots }) {
    const articleInfo = toRef(props, "info");
    const { info: pageInfo, items } = useArticleInfo(props);

    return (): VNode => {
      const {
        [ArticleInfoType.title]: title,
        [ArticleInfoType.type]: type,
        [ArticleInfoType.isEncrypted]: isEncrypted = false,
        [ArticleInfoType.cover]: cover,
        [ArticleInfoType.excerpt]: excerpt,
        [ArticleInfoType.sticky]: sticky,
      } = articleInfo.value;
      const info = pageInfo.value;

      return h(
        "div",
        { class: "article-item" },
        h(
          "article",
          {
            class: "article",
            vocab: "https://schema.org/",
            typeof: "Article",
          },
          [
            slots.cover?.({ cover }) ||
              (cover
                ? [
                    h("img", {
                      class: "article-cover",
                      src: withBase(cover),
                    }),
                    h("meta", {
                      property: "image",
                      content: withBase(cover),
                    }),
                  ]
                : []),
            sticky ? h(StickyIcon) : null,
            h(
              RouterLink,
              { to: props.path },
              () =>
                slots.title?.({ title, isEncrypted, type }) ||
                h("header", { class: "title" }, [
                  isEncrypted ? h(LockIcon) : null,
                  type === PageType.slide ? h(SlideIcon) : null,
                  h("span", { property: "headline" }, title),
                ])
            ),
            slots.excerpt?.({ excerpt }) ||
              (excerpt
                ? h("div", {
                    class: "article-excerpt",
                    innerHTML: excerpt,
                  })
                : null),
            h("hr", { class: "hr" }),
            slots.info?.({ info }) ||
              h(PageInfo, {
                info,
                ...(items.value ? { items: items.value } : {}),
              }),
          ]
        )
      );
    };
  },
});
