import { attrs } from "./attrs.js";
import { figure } from "./figure.js";

import type MarkdownIt from "markdown-it";
import type { RendererContext } from "vscode-notebook-renderer";

interface MarkdownItRenderer {
  extendMarkdownIt(extender: (markdownIt: MarkdownIt) => void): void;
}

export const activate = async (context: RendererContext<void>) => {
  // FIXME: Debug
  console.log("Plugin loaded");

  const markdownItRenderer = (await context.getRenderer(
    "vscode.markdown-it-renderer"
  )) as MarkdownItRenderer | undefined;

  if (!markdownItRenderer)
    throw new Error(`Could not load 'vscode.markdown-it-renderer'`);

  markdownItRenderer.extendMarkdownIt((md: MarkdownIt) => {
    md.use(attrs);
    md.use(figure);
    // md.use(footnote);
    // md.use(imageLazyload);
    // md.use(imageMark);
    // md.use(imageSize);
    // md.use(sub);
    // md.use(sup);
    // md.use(tasklist);
  });
};
