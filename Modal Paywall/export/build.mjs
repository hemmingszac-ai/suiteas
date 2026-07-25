import { build } from "esbuild";
import { mkdirSync } from "node:fs";

mkdirSync("dist", { recursive: true });

const shared = {
  bundle: true,
  format: "iife",
  target: "es2020",
  loader: { ".png": "dataurl", ".svg": "dataurl" },
  define: { "process.env.NODE_ENV": '"production"' },
  minify: true,
  sourcemap: true,
};

await build({
  ...shared,
  entryPoints: ["mount.tsx"],
  outfile: "dist/suiteas-pay.js",
});
console.log("Built dist/suiteas-pay.js");

await build({
  ...shared,
  entryPoints: ["mount-section.tsx"],
  outfile: "dist/suiteas-pay-section.js",
});
console.log("Built dist/suiteas-pay-section.js");
