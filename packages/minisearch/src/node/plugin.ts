import { type Plugin } from "@vuepress/core";
import { useSassPalettePlugin } from "vuepress-plugin-sass-palette";
import { getLocales } from "vuepress-shared/node";

import { minisearchLocales } from "./locales.js";
import { type MinisearchOptions } from "./options.js";
import { prepareIndex } from "./prepare.js";
import { CLIENT_FOLDER } from "./utils.js";

export const minisearchPlugin =
  (options: MinisearchOptions): Plugin =>
  (app) => {
    useSassPalettePlugin(app, { id: "hope" });

    return {
      name: "vuepress-plugin-minisearch",

      define: {
        MINISEARCH_LOCALES: getLocales({
          app,
          name: "minisearch",
          config: options.locales,
          default: minisearchLocales,
        }),
        MINISEARCH_QUERY_HISTORY: options.queryHistory ?? true,
        MINISEARCH_DETAILED_VIEW: options.detailedView ?? true,
      },

      onPrepared: async (app): Promise<void> => {
        await prepareIndex(app);
      },

      clientConfigFile: `${CLIENT_FOLDER}config.js`,
    };
  };
