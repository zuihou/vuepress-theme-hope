import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import esbuild from "rollup-plugin-esbuild";

import type { Plugin, RollupOptions } from "rollup";

const isProduction = process.env["NODE_ENV"] === "production";

const getRollupPlugin = (filePath: string): RollupOptions => ({
  input: `./src/${filePath}.ts`,
  output: [
    {
      file: `./lib/${filePath}.js`,
      format: "cjs",
      sourcemap: true,
      exports: "named",
    },
  ],
  plugins: [
    nodeResolve({ preferBuiltins: true }),
    // @ts-ignore
    commonjs(),
    // @ts-ignore
    esbuild({ charset: "utf8", minify: isProduction, target: "node14" }),
  ],
  treeshake: {
    unknownGlobalSideEffects: false,
  },
});

export default [getRollupPlugin("node/index")];
