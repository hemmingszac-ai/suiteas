import { build } from "esbuild";
import { mkdirSync } from "node:fs";

mkdirSync("dist", { recursive: true });

await build({
  entryPoints: ["mount.tsx"],
  bundle: true,
  format: "iife",
  target: "es2020",
  outfile: "dist/suiteas-pay.js",
  loader: { ".png": "dataurl", ".svg": "dataurl" },
  define: { "process.env.NODE_ENV": '"production"' },
  minify: true,
  sourcemap: true,
});

console.log("Built dist/suiteas-pay.js");
