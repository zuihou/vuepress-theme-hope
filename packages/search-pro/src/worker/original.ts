import MiniSearch from "minisearch";
import { entries, fromEntries } from "vuepress-shared/client";

import { getResults } from "../client/utils/index.js";
import { type SearchIndex } from "../shared/index.js";

declare const SEARCH_PRO_INDEX: string;

interface SearchData {
  query: string;
  routeLocale: string;
}

const searchIndex: SearchIndex = fromEntries(
  entries(<Record<string, string>>JSON.parse(SEARCH_PRO_INDEX)).map(
    ([localePath, index]) => [
      localePath,
      MiniSearch.loadJSON(index, {
        fields: ["title", "header", "text", "customFields"],
        storeFields: ["title", "header", "text", "customFields"],
      }),
    ]
  )
);

self.onmessage = ({ data }: MessageEvent<SearchData>): void => {
  self.postMessage(getResults(data.query, searchIndex[data.routeLocale]));
};
