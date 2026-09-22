import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const distRoot = resolve(projectRoot, "dist");
const runtimePath = resolve(projectRoot, "worker/runtime.js");
const outputPath = resolve(distRoot, "server/index.js");

const textAssets = {
  "/": await readFile(resolve(distRoot, "index.html"), "utf8"),
  "/index.html": await readFile(resolve(distRoot, "index.html"), "utf8"),
  "/data/news.js": await readFile(resolve(distRoot, "data/news.js"), "utf8"),
  "/data/opta-stats.js": await readFile(resolve(distRoot, "data/opta-stats.js"), "utf8"),
  "/data/status.json": await readFile(resolve(distRoot, "data/status.json"), "utf8"),
  "/data/statsbomb-open-players.json": await readFile(resolve(distRoot, "data/statsbomb-open-players.json"), "utf8"),
};

const fontNames = [
  "IRANSansXFaNum-Bold.woff2",
  "IRANSansXFaNum-DemiBold.woff2",
  "IRANSansXFaNum-Medium.woff2",
  "IRANSansXFaNum-Regular.woff2",
];
const binaryAssets = {};
for (const name of fontNames) {
  binaryAssets[`/assets/fonts/${name}`] = (await readFile(resolve(distRoot, "assets/fonts", name))).toString("base64");
}
binaryAssets["/assets/images/nimkat-logo-v2.png"] = (
  await readFile(resolve(distRoot, "assets/images/nimkat-logo-v2.png"))
).toString("base64");
binaryAssets["/assets/images/nimkat-wordmark-v1.png"] = (
  await readFile(resolve(distRoot, "assets/images/nimkat-wordmark-v1.png"))
).toString("base64");

const runtime = await readFile(runtimePath, "utf8");
const source = [
  `const TEXT_ASSETS = ${JSON.stringify(textAssets)};`,
  `const BINARY_ASSETS = ${JSON.stringify(binaryAssets)};`,
  runtime,
].join("\n");

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, source);
console.log(`Built ${outputPath}`);
