import { deepAssign } from "vuepress-shared";
import { compressToEncodedURIComponent } from "./ventors/lzstring.js";
import { optionDeclarations } from "./ventors/optionDelcarations.js";

import type { CompilerOptions } from "typescript";
import type {
  PlaygroundData,
  PlaygroundOptions,
  TSPresetPlaygroundOptions,
} from "../../../shared/index.js";

/** Gets a query string representation (hash + queries) */
export const getURL = (
  code: string,
  compilerOptions: CompilerOptions = {}
): string => {
  const hash = `#code/${compressToEncodedURIComponent(code)}`;

  const queryString = Object.entries(compilerOptions)
    .map(([key, value]) => {
      const item = optionDeclarations.find((option) => option.name === key)!;

      if (!item || value === null || value === undefined) return "";

      const { type } = item;

      if (typeof type === "object") {
        const result = type[value as keyof typeof type];

        return result?.toString() || "";
      }

      return `${key}=${encodeURIComponent(value as string)}`;
    })
    .filter((value) => value.length)
    .join("&");

  return `${queryString ? `?${queryString}` : ""}${hash}`;
};

export const getTSPlaygroundPreset = ({
  service = "https://www.typescriptlang.org/play",
  ...compilerOptions
}: TSPresetPlaygroundOptions = {}): PlaygroundOptions => ({
  name: "playground#ts",
  propsGetter: ({
    title = "",
    files,
    settings,
    key,
  }: PlaygroundData): Record<string, string> => {
    const projectFiles = Object.entries(files)
      .filter(([key]) => key.match(/\.[jt]sx?$/))
      .map(([key, info]) => ({
        filename: key,
        ...info,
      }));

    let inputFile = projectFiles.find(({ filename }) =>
      filename.match(/^input\.[jt]sx?$/)
    );

    if (!inputFile) {
      console.error(
        "TS files should have an entry named 'input.js/ts/jsx/tsx'"
      );
      inputFile = { filename: "input.ts", content: "", ext: "ts" };
    }

    const content = `${inputFile.content}\n${projectFiles
      .filter(({ filename }) => filename !== inputFile!.filename)
      .map(({ filename, content }) => `// @filename: ${filename}\n${content}`)
      .join("\n")}`;

    const link = `${service}${getURL(
      content,
      deepAssign(
        {},
        <CompilerOptions>settings || {},
        <CompilerOptions>compilerOptions
      )
    )}`;

    return {
      key,
      title,
      link: encodeURIComponent(link),
    };
  },
});
