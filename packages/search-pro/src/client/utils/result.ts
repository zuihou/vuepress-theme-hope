import MiniSearch from "minisearch";
import { entries, keys } from "vuepress-shared/client";

import { type Word, getMatchedContent } from "./matchContent.js";
import { type IndexItem } from "../../shared/index.js";
import { SearchResult } from "minisearch";

export interface TitleMatchedItem {
  type: "title";
  display: Word[];
  path: string;
}

export interface HeadingMatchedItem {
  type: "heading";
  display: Word[];
  path: string;
}

export interface CustomMatchedItem {
  type: "custom";
  path: string;
  index: string;
  display: Word[];
}

export interface ContentMatchedItem {
  type: "content";
  path: string;
  header: string;
  display: Word[];
}

export type MatchedItem =
  | TitleMatchedItem
  | HeadingMatchedItem
  | ContentMatchedItem
  | CustomMatchedItem;

export interface Result {
  title: string;
  contents: MatchedItem[];
}

const getResultsWeight = (matchedItem: MatchedItem[]): number =>
  matchedItem.reduce<number>(
    (current, { type }) =>
      current +
      (type === "title"
        ? 50
        : type === "heading"
        ? 20
        : type === "custom"
        ? 10
        : 1),
    0
  );

export const getResults = (
  queryString: string,
  localeIndex: MiniSearch<IndexItem>
): Result[] => {
  const suggestions = <Record<string, MatchedItem[]>>{};

  const results = localeIndex.search(queryString, {
    fuzzy: 0.2,
    prefix: true,
    boost: { header: 4, text: 2, title: 1 },
  }) as unknown as (SearchResult & IndexItem)[];

  results.forEach((result) => {
    const { terms } = result;

    if(result.header)
  });

  for (const [path, pageIndex] of entries(results)) {
    // const parentPageTitle =
    //   localeIndex[path.replace(/\/[^\\]*$/, "")]?.title || "";
    // const title = `${parentPageTitle ? `${parentPageTitle} > ` : ""}${
    //   pageIndex.title
    // }`;
    const title = result;

    const titleContent = getMatchedContent(pageIndex.title, queryString);

    if (titleContent)
      suggestions[title] = [
        ...(suggestions[title] || []),
        {
          type: "title",
          path,
          display: titleContent,
        },
      ];

    if (pageIndex.customFields)
      entries(pageIndex.customFields).forEach(([index, customFields]) => {
        customFields.forEach((customField) => {
          const customFieldContent = getMatchedContent(
            customField,
            queryString
          );

          if (customFieldContent)
            suggestions[title] = [
              ...(suggestions[title] || []),
              {
                type: "custom",
                path,
                index,
                display: customFieldContent,
              },
            ];
        });
      });

    for (const headerIndex of pageIndex.contents) {
      const headerContent = getMatchedContent(headerIndex.header, queryString);

      if (headerContent)
        suggestions[title] = [
          ...(suggestions[title] || []),
          {
            type: "heading",
            path: path + (headerIndex.anchor ? `#${headerIndex.anchor}` : ""),
            display: headerContent,
          },
        ];

      for (const content of headerIndex.text) {
        const matchedContent = getMatchedContent(content, queryString);

        if (matchedContent)
          suggestions[title] = [
            ...(suggestions[title] || []),
            {
              type: "content",
              header: headerIndex.header,
              path: path + (headerIndex.anchor ? `#${headerIndex.anchor}` : ""),
              display: matchedContent,
            },
          ];
      }
    }
  }

  return keys(suggestions)
    .sort(
      (titleA, titleB) =>
        getResultsWeight(suggestions[titleA]) -
        getResultsWeight(suggestions[titleB])
    )
    .map((title) => ({ title, contents: suggestions[title] }));
};
