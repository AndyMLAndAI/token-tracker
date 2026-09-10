import path from "path";
import fs from "fs";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

async function main() {
  const entryPoint = path.resolve("./src/index.ts");
  const outDir = path.resolve("./out");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const outputLocation = path.join(outDir, "token-tracker-trailer.mp4");

  console.log("1. Bundling Remotion project from", entryPoint);
  const bundleLocation = await bundle({
    entryPoint,
    onProgress: (pct) => {
      console.log(`Bundling: ${pct}%`);
    },
  });
  console.log("Bundle created at:", bundleLocation);

  console.log("2. Selecting composition 'TokenTrackerTrailer'...");
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: "TokenTrackerTrailer",
  });
  console.log("Selected composition:", {
    id: composition.id,
    durationInFrames: composition.durationInFrames,
    fps: composition.fps,
    width: composition.width,
    height: composition.height,
  });

  console.log("3. Rendering video to", outputLocation);
  let lastPct = -1;
  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation,
    onProgress: ({ progress }) => {
      const pct = Math.floor(progress * 100);
      if (pct !== lastPct && pct % 10 === 0) {
        lastPct = pct;
        console.log(`Render progress: ${pct}%`);
      }
    },
  });

  console.log("Rendering complete! File saved at:", outputLocation);
  const stats = fs.statSync(outputLocation);
  console.log(`Output file size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
}

main().catch((err) => {
  console.error("Render failed:", err);
  process.exit(1);
});
