import { defineUserConfig } from "@vuepress/cli";
import { defaultTheme } from "@vuepress/theme-default";
import { minisearchPlugin } from "vuepress-plugin-minisearch";

const base = <"/" | `/${string}/`>process.env["BASE"] || "/";

export default defineUserConfig({
  base,

  title: "Minisearch",

  description: "VuePress Client Search plugin",

  theme: defaultTheme({
    logo: "/logo.svg",

    repo: "vuepress-theme-hope/vuepress-theme-hope/tree/main/demo/minisearch/",

    navbar: ["/", "/demo"],
  }),

  plugins: [minisearchPlugin({})],
});
