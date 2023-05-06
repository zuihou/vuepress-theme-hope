import { App } from "@vuepress/core";

import { generateIndex } from "./generateIndex.js";

export const prepareIndex = async (app: App): Promise<void> => {
  const searchIndex = await generateIndex(app);

  for (const [locale, documents] of searchIndex)
    app.writeTemp(`minisearch/${locale}.js`, JSON.stringify({ documents }));

  searchIndex.keys();
};
