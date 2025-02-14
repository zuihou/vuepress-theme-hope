import { type BasePageFrontMatter } from "vuepress-shared";

export interface CommentPluginFrontmatter extends BasePageFrontMatter {
  /**
   * 是否启用评论
   *
   * Whether Enable Comment
   *
   * @default true
   */
  comment?: boolean;

  /**
   * Comment identifier
   *
   * 评论标识符
   */
  commentID?: string;

  /**
   * @description Only available when using valine
   *
   * 是否启用访问量
   *
   * Whether enable pageviews
   *
   * @default true
   */
  pageview?: boolean;
}
