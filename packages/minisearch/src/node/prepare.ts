import { App } from "@vuepress/core";
import { entries, keys } from "vuepress-shared";

import { generateIndex } from "./generateIndex.js";

export const prepareIndex = async (app: App): Promise<void> => {
  const searchIndex = await generateIndex(app);

  await Promise.all(
    entries(searchIndex).map(([locale, documents]) =>
      app.writeTemp(
        `minisearch/${locale}.js`,
        `export default ${JSON.stringify(documents)};`
      )
    )
  );

  await app.writeTemp(
    `minisearch/index.js`,
    `export default {${keys(searchIndex)
      .map(
        (locale) => `${JSON.stringify(locale)}: () => import('./${locale}.js')`
      )
      .join(",")}}`
  );
};
