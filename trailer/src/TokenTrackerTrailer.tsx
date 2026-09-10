import React, { useEffect, useState } from "react";
import { AbsoluteFill, useCurrentFrame, delayRender, continueRender } from "remotion";

import { loadFont as loadLora } from "@remotion/google-fonts/Lora";
import { loadFont as loadPlayfairDisplay } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadSourceSerif4 } from "@remotion/google-fonts/SourceSerif4";
import { loadFont as loadMerriweather } from "@remotion/google-fonts/Merriweather";
import { loadFont as loadCrimsonPro } from "@remotion/google-fonts/CrimsonPro";
import { loadFont as loadLibreBaskerville } from "@remotion/google-fonts/LibreBaskerville";
import { loadFont as loadCormorantGaramond } from "@remotion/google-fonts/CormorantGaramond";
import { loadFont as loadPTSerif } from "@remotion/google-fonts/PTSerif";
import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadArchivo } from "@remotion/google-fonts/Archivo";
import { loadFont as loadSora } from "@remotion/google-fonts/Sora";
import { loadFont as loadManrope } from "@remotion/google-fonts/Manrope";
import { loadFont as loadDMSans } from "@remotion/google-fonts/DMSans";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";

// Pre-load all 16 fonts (default loads 'normal' style with all available weights)
const fontLoaders = [
  loadLora(),
  loadPlayfairDisplay(),
  loadSourceSerif4(),
  loadMerriweather(),
  loadCrimsonPro(),
  loadLibreBaskerville(),
  loadCormorantGaramond(),
  loadPTSerif(),
  loadGeist(),
  loadInter(),
  loadSpaceGrotesk(),
  loadArchivo(),
  loadSora(),
  loadManrope(),
  loadDMSans(),
  loadJetBrainsMono(),
];

interface SegmentConfig {
  duration: number;
  fontFamily: string;
  fontWeight: number | string;
  letterSpacing?: string;
  bg: string;
  color: string;
}

const SEGMENTS: SegmentConfig[] = [
  // 1. Lora (serif), weight 600, bg #87CEEB, text #141413
  {
    duration: 10,
    fontFamily: fontLoaders[0].fontFamily,
    fontWeight: 600,
    bg: "#87CEEB",
    color: "#141413",
  },
  // 2. Playfair Display, weight 600, bg #F5E3C7, text #141413
  {
    duration: 10,
    fontFamily: fontLoaders[1].fontFamily,
    fontWeight: 600,
    bg: "#F5E3C7",
    color: "#141413",
  },
  // 3. Source Serif 4, weight 600, bg #E3DACC, text #141413
  {
    duration: 10,
    fontFamily: fontLoaders[2].fontFamily,
    fontWeight: 600,
    bg: "#E3DACC",
    color: "#141413",
  },
  // 4. Merriweather, weight 700, bg #D97757, text #FAF9F5
  {
    duration: 10,
    fontFamily: fontLoaders[3].fontFamily,
    fontWeight: 700,
    bg: "#D97757",
    color: "#FAF9F5",
  },
  // 5. Crimson Pro, weight 600, bg #3D3D3A, text #FAF9F5
  {
    duration: 10,
    fontFamily: fontLoaders[4].fontFamily,
    fontWeight: 600,
    bg: "#3D3D3A",
    color: "#FAF9F5",
  },
  // 6. Libre Baskerville, weight 700, bg #10B981, text #141413
  {
    duration: 10,
    fontFamily: fontLoaders[5].fontFamily,
    fontWeight: 700,
    bg: "#10B981",
    color: "#141413",
  },
  // 7. Cormorant Garamond, weight 600, bg #B0AEA5, text #141413
  {
    duration: 10,
    fontFamily: fontLoaders[6].fontFamily,
    fontWeight: 600,
    bg: "#B0AEA5",
    color: "#141413",
  },
  // 8. PT Serif, weight 700, bg #F0EEE6, text #141413
  {
    duration: 10,
    fontFamily: fontLoaders[7].fontFamily,
    fontWeight: 700,
    bg: "#F0EEE6",
    color: "#141413",
  },
  // 9. Geist Sans, weight 700, bg #FFFFFF, text #000000
  {
    duration: 10,
    fontFamily: fontLoaders[8].fontFamily,
    fontWeight: 700,
    bg: "#FFFFFF",
    color: "#000000",
  },
  // 10. Inter, weight 700, bg #EF4444, text #FFFFFF
  {
    duration: 10,
    fontFamily: fontLoaders[9].fontFamily,
    fontWeight: 700,
    bg: "#EF4444",
    color: "#FFFFFF",
  },
  // 11. Space Grotesk, weight 700, bg #3B82F6, text #FFFFFF
  {
    duration: 10,
    fontFamily: fontLoaders[10].fontFamily,
    fontWeight: 700,
    bg: "#3B82F6",
    color: "#FFFFFF",
  },
  // 12. Archivo, weight 700, bg #FACC15, text #141413
  {
    duration: 10,
    fontFamily: fontLoaders[11].fontFamily,
    fontWeight: 700,
    bg: "#FACC15",
    color: "#141413",
  },
  // 13. Sora, weight 700, bg #8B5CF6, text #FFFFFF
  {
    duration: 10,
    fontFamily: fontLoaders[12].fontFamily,
    fontWeight: 700,
    bg: "#8B5CF6",
    color: "#FFFFFF",
  },
  // 14. Manrope, weight 700, bg #F97316, text #141413
  {
    duration: 10,
    fontFamily: fontLoaders[13].fontFamily,
    fontWeight: 700,
    bg: "#F97316",
    color: "#141413",
  },
  // 15. DM Sans, weight 700, bg #EC4899, text #FFFFFF
  {
    duration: 10,
    fontFamily: fontLoaders[14].fontFamily,
    fontWeight: 700,
    bg: "#EC4899",
    color: "#FFFFFF",
  },
  // 16. JetBrains Mono, weight 700, tracking +0.05em, bg #000000, text #FFFFFF (45 frames)
  {
    duration: 45,
    fontFamily: fontLoaders[15].fontFamily,
    fontWeight: 700,
    letterSpacing: "0.05em",
    bg: "#000000",
    color: "#FFFFFF",
  },
];

export const TokenTrackerTrailer: React.FC = () => {
  const frame = useCurrentFrame();
  const [handle] = useState(() => delayRender("Waiting for fonts to load"));

  useEffect(() => {
    Promise.all(fontLoaders.map((f) => f.waitUntilDone()))
      .then(() => {
        continueRender(handle);
      })
      .catch((err) => {
        console.error("Font loading error:", err);
        continueRender(handle);
      });
  }, [handle]);

  // Determine current segment based on frame
  let accumulatedFrames = 0;
  let currentSegment = SEGMENTS[SEGMENTS.length - 1];

  for (const seg of SEGMENTS) {
    if (frame < accumulatedFrames + seg.duration) {
      currentSegment = seg;
      break;
    }
    accumulatedFrames += seg.duration;
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: currentSegment.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
      }}
    >
      <div
        style={{
          fontFamily: `"${currentSegment.fontFamily}", sans-serif`,
          fontWeight: currentSegment.fontWeight,
          letterSpacing: currentSegment.letterSpacing || "normal",
          color: currentSegment.color,
          fontSize: 210,
          lineHeight: 1,
          textAlign: "center",
        }}
      >
        v1.8
      </div>
    </AbsoluteFill>
  );
};
