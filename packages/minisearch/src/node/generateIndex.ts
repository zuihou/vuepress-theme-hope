import { type App } from "@vuepress/core";
// import { type AnyNode, type Element, load } from "cheerio";
import MiniSearch from "minisearch";
import { entries } from "vuepress-shared";

export interface PageSection {
  anchor: string;
  titles: string[];
  text: string;
}

const HEADING_REGEXP = /<h(\d*).*?>(<a.*? href="#.*?".*?>.*?<\/a>.*?)<\/h\1>/gi;
const HEADING_CONTENT_REGEXP = /<a.*? href="#(.*?)".*?>.*?<\/a>(.*)/i;

// TODO: Improve this
export const clearHtmlTags = (str: string): string =>
  str.replace(/<[^>]*>/g, "");

/**
 * Splits HTML into sections based on headings
 */
export const splitPageIntoSections = (
  pageTitle: string,
  content: string
): PageSection[] => {
  const result = content.split(HEADING_REGEXP);

  result.shift();

  let parentTitles: string[] = [];

  parentTitles["1"] = pageTitle;

  const sections: PageSection[] = [];

  for (let i = 0; i < result.length; i += 3) {
    const level = parseInt(result[i]) - 1;
    const heading = result[i + 1];
    const headingResult = HEADING_CONTENT_REGEXP.exec(heading);

    // TODO: Improve this
    const title = clearHtmlTags(headingResult?.[2] ?? "").trim();

    const anchor = headingResult?.[1] ?? "";
    const content = result[i + 2];

    if (!title || !content) continue;

    const titles = parentTitles.slice(0, level);

    titles[level] = title;

    sections.push({ anchor, titles, text: clearHtmlTags(content) });

    if (level === 0) parentTitles = [title];
    else parentTitles[level] = title;
  }

  return sections;
};

interface IndexObject {
  id: string;
  text: string;
  title: string;
  titles: string[];
}

export const generateIndex = async ({
  pages,
}: App): Promise<Record<string, MiniSearch<IndexObject>>> => {
  const documentsByLocale: Record<string, IndexObject[]> = {};

  pages.map(({ title, contentRendered, data, pathLocale }) => {
    const sections = splitPageIntoSections(title, contentRendered);
    const documents = (documentsByLocale[pathLocale] ??= []);

    documents.push(
      ...sections.map(({ anchor, titles, text }) => ({
        id: `${data.key}${anchor ? `#${anchor}` : ""}`,
        text: text,
        title: titles.at(-1)!,
        titles: titles.slice(0, -1),
      }))
    );
  });

  const indexByLocales: Record<string, MiniSearch<IndexObject>> = {};

  await Promise.all(
    entries(documentsByLocale).map(async ([locale, documents]) => {
      const index = new MiniSearch<IndexObject>({
        fields: ["title", "titles", "text"],
        storeFields: ["title", "titles"],
        searchOptions: {
          fuzzy: 0.2,
          prefix: true,
          boost: { title: 4, text: 2, titles: 1 },
        },
      });

      await index.addAllAsync(documents);

      indexByLocales[locale] = index;
    })
  );

  return indexByLocales;
};
